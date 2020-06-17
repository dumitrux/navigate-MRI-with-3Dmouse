import { colors, files } from './utils.js';
import 'https://rawgit.com/archilogic-com/aframe-space-navigator-controls/master/dist/aframe-space-navigator-controls.js';

// Setup
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

// aframe-space-navigator-controls
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

// Observer point (same as Camera point)
controls.position.x = 0;
controls.position.y = 118;
controls.position.z = 280;


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
    stackHelper.border.visible = true;

    scene.add(stackHelper);

    // build the gui
    gui(stackHelper);


    // stack center calculation

    // Origin point is one of the vertex
    var P1 = new THREE.Vector3(
      stack._origin.x,
      stack._origin.y,
      stack._origin.z
    );

    // Vector which point to another vertex from the origin vertex
    var vectorD1 = new THREE.Vector3(
      stack.frame[0].imageOrientation[0],
      stack.frame[0].imageOrientation[1],
      stack.frame[0].imageOrientation[2]
    );

    // Vector which point to another vertex from the origin vertex
    var vectorD2 = new THREE.Vector3(
      stack.frame[0].imageOrientation[3],
      stack.frame[0].imageOrientation[4],
      stack.frame[0].imageOrientation[5]
    );

    var P2 = new THREE.Vector3(
      P1.x + (vectorD2.x * 220),
      P1.y + (vectorD2.y * 220),
      P1.z + (vectorD2.z * 220)
    );

    var P3 = new THREE.Vector3(
      P2.x + (vectorD1.x * 165),
      P2.y + (vectorD1.y * 165),
      P2.z + (vectorD1.z * 165)
    );

    var P4 = new THREE.Vector3(
      P1.x + (vectorD1.x * 165),
      P1.y + (vectorD1.y * 165),
      P1.z + (vectorD1.z * 165)
    );

    // Calculation of the middle of the stack
    var middle = new THREE.Vector3();

    middle.x = P1.x + (vectorD1.x * 82.5) + (vectorD2.x * 110);
    middle.y = P1.y + (vectorD1.y * 82.5) + (vectorD2.y * 110);
    middle.z = P1.z + (vectorD1.z * 82.5) + (vectorD2.z * 110);


    // Display a cube to see where a point is
    function makeInstance(color, size, x, y, z) {
      var geometry = new THREE.BoxGeometry(size, size, size);
      var material = new THREE.MeshBasicMaterial({ color });

      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      cube.position.x = x;
      cube.position.y = y;
      cube.position.z = z;
    }

    //makeInstance(0x44aa88, 10, middle.x, middle.y, middle.z);
    //makeInstance(0x44aa88, 10, P1.x, P1.y, P1.z);
    //makeInstance(0x44aa88, 10, P2.x, P2.y, P2.z);
    //makeInstance(0x44aa88, 10, P3.x, P3.y, P3.z);
    //makeInstance(0x44aa88, 10, P4.x, P4.y, P4.z);


    // center camera to the center of the stack
    camera.up.set(vectorD2.x - 0.009, -vectorD2.y, vectorD2.z);
    camera.lookAt(middle.x, middle.y, middle.z);
    camera.updateProjectionMatrix();
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

  // when using mousewheel to control camera FOV
  camera.fov = controls.fov
  camera.updateProjectionMatrix();

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
