import { colors, files } from './utils.js';
import 'https://rawgit.com/archilogic-com/aframe-space-navigator-controls/master/dist/aframe-space-navigator-controls.js';

// Classic ThreeJS setup
const container = document.getElementById('container');
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(container.offsetWidth, container.offsetHeight);
renderer.setClearColor(colors.darkGrey, 1);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();


const camera = new THREE.PerspectiveCamera(
  45,
  container.offsetWidth / container.offsetHeight,
  0.1,
  1000
);

/*
const size = 200;
const near = 0.1;
const far = 500;
const camera = new THREE.OrthographicCamera(-size, size, size, -size, near, far);
*/


var options = {
  controllerId: 0,
  movementEnabled: true,
  lookEnabled: false,
  rollEnabled: true,
  invertPitch: true,
  fovEnabled: true,
  fovMin: 0.01,
  fovMax: 115,
  rotationSensitivity: 0.05,
  movementEasing: 3,
  movementAcceleration: 1000,
  fovSensitivity: 0.01,
  fovEasing: 3,
  fovAcceleration: 5,
  invertScroll: true
}
var controls = new THREE.SpaceNavigatorControls(options);

const onWindowResize = () => {
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.offsetWidth, container.offsetHeight);
};

window.addEventListener('resize', onWindowResize, false);

// Load DICOM images and create AMI Helpers
const loader = new AMI.VolumeLoader(container);
loader
  .load(files)
  .then(() => {
    const series = loader.data[0].mergeSeries(loader.data);
    const stack = series[0].stack[0];
    loader.free();

    const stackHelper = new AMI.StackHelper(stack);
    stackHelper.bbox.visible = false;
    stackHelper.border.color = colors.blue;

    scene.add(stackHelper);

    // build the gui
    gui(stackHelper);


    // center camera and interactor to center of bouding box
    const centerLPS = stackHelper.stack.worldCenter();
    camera.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
    camera.updateProjectionMatrix();

    // center camera
    controls.position.x = centerLPS.x;
    controls.position.y = centerLPS.y;
    controls.position.z = centerLPS.z + 240;
  })
  .catch(error => {
    window.console.log('oops... something went wrong...');
    window.console.log(error);
  });

const animate = (time) => {
  // update space navigator
  controls.update();
  // update camera position
  camera.position.copy(controls.position);
  // update camera rotation
  camera.rotation.copy(controls.rotation);
  // when using mousewheel to control FOV
  camera.fov = controls.fov;

  renderer.render(scene, camera);

  requestAnimationFrame(() => {
    animate();
  });
};
animate();

// setup gui
const gui = stackHelper => {
  const stack = stackHelper.stack;
  const gui = new dat.GUI({
    autoPlace: false,
  });
  const customContainer = document.getElementById('my-gui-container');
  customContainer.appendChild(gui.domElement);

  // stack
  const stackFolder = gui.addFolder('Stack');
  // index range depends on stackHelper orientation.
  const index = stackFolder
    .add(stackHelper, 'index', 0, stack.dimensionsIJK.z - 1)
    .step(1)
    .listen();
  const orientation = stackFolder
    .add(stackHelper, 'orientation', 0, 2)
    .step(1)
    .listen();
  orientation.onChange(value => {
    index.__max = stackHelper.orientationMaxIndex;
    stackHelper.index = Math.floor(index.__max / 2);
  });
  stackFolder.open();

  // slice
  const sliceFolder = gui.addFolder('Slice');
  sliceFolder
    .add(stackHelper.slice, 'windowWidth', 1, stack.minMax[1] - stack.minMax[0])
    .step(1)
    .listen();
  sliceFolder
    .add(stackHelper.slice, 'windowCenter', stack.minMax[0], stack.minMax[1])
    .step(1)
    .listen();
  sliceFolder.add(stackHelper.slice, 'intensityAuto').listen();
  sliceFolder.add(stackHelper.slice, 'invert');
  sliceFolder.open();

  // border
  const borderFolder = gui.addFolder('Border');
  borderFolder.add(stackHelper.border, 'visible');
  borderFolder.addColor(stackHelper.border, 'color');
  borderFolder.open();
};
