# Navigate MRI with 3D mouse
It displays MRI in 2D and 3D multi-slice views, with easy search and navigation with a 3D mouse.

### 2D
![2D](./assets/2d.gif)

### 3D
![3D](./assets/3d.gif)


## Table of content
* [Motivation](#motivation)
* [Content](#content)
* [Development](#development)
* [License](#license)
* [Links](#links)
* [Author](#author)


## Motivation
A university project made for the course **Human-Computer Interaction Laboratory** at Masaryk University (Czech Republic).

Magnetic Resonance Imaging (MRI) is a medical imaging technique used in radiology to form pictures of the anatomy and the physiological processes of the body.


## Content
* **files**: an example of the NII file type, which is primarily associated with NIfTI-1 Data Format.
* **visualization_2D**: source code to visualize the MRI image in 2 dimensions and interact with a 3D mouse.
* **volume**: source code to visualize the MRI image in 3 dimensions and interact with a 3D mouse.


## Development
* **Neuroimaging Informatics Technology Initiative ([NIFTI](https://nifti.nimh.nih.gov/))**: format for multi-dimensional neuroimaging data, to represent the MRI.


* **AMI Medical Imaging (AMI) Javascript Toolkit([ami](https://github.com/FNNDSC/ami))**: to show the NIFTI type files in 2D and 3D on the browser.

* **[Space Navigator Controls for WebGL](https://github.com/archilogic-com/aframe-space-navigator-controls)**: to connect "Space Navigator" 3D mouse by 3Dconnexion to JavaScript via gamepad browser API.

* **[three.js](https://github.com/mrdoob/three.js/)**: the others libraries are based on three.js, so it is essential to know how it works.


## License
MIT License


## Links
* [Scalable Brain Atlas](https://scalablebrainatlas.incf.org/mouse/ABA12) (Web which displays brain regions and reference images in 2d and 3d multi-slice views.)


## Author
Danci, Marian Dumitru ([@dumitrux](https://github.com/dumitrux))