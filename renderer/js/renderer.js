const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');


function loadImage(e) {
  const file = e.target.files[0];

  if(!isFileImage(file)) {
    alertError("message: file is not an image.")
    return;
  }

  //Get original image size
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function() {
    widthInput.value = this.width;
    heightInput.value = this.height;
  }

  form.style.display = 'block';
  filename.innerText = file.name;
  outputPath.innerText = path.join(os.homedir(), 'imageresizer')
}

//Sends image data to main process
function sendImage(e) {
  e.preventDefault();

  const imgPath = img.files[0].path;
  const width = widthInput.value;
  const height= heightInput.value;
  
  if (!img.files[0]) {
    alertError("message: please upload an image");
    return;
  }

  if (width === '' || height === '') {
    alertError("message: please enter a valid width and height");
    return;
  }

  ipcRenderer.send("image:resize", {
    imgPath,
    width,
    height
  });
}

// Catch the image:done event 
ipcRenderer.on('image:done', () => {
  alertSuccess(`message: image resized to ${widthInput.value} x ${heightInput.value}`);
})

function isFileImage(file) {
  const acceptedImageTypes = ['image/gif', 'image/png', 'image/jpeg'];
  return file && acceptedImageTypes.includes(file['type']);
}

function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: "red",
      color: "white",
      textAlign: "center",
    },
  })
}

function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: "green",
      color: "white",
      textAlign: "center",
    },
  })
}

img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);