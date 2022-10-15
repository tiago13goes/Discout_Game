// var src_image = "/fiap.jpg"
var src_image = "https://www.sejabixo.com.br/wp-content/uploads/2021/11/vestibular-fiap-2022-2.jpg"
var size = { height: 0, width: 0 }
var started = false
var found = false
var position = { x: 0, y: 0, width: 100, height: 100 }
var timer = 0
var contador = null
var contadorGameOver = null
var contadorChangeObjectPosition = null

var onHoverCanvas = () => {
  $(".magnified").hover(function (e) {

    if (started) {
      //Store position & dimension information of image
      var imgPosition = $(".magnify").position(),
        imgHeight = $(".magnified").height(),
        imgWidth = $(".magnified").width();

      //Show mangifier on hover
      $(".magnifier").show();

      //While the mouse is moving and over the image move the magnifier and magnified image
      $(this).mousemove(function (e) {
        //Store position of mouse as it moves and calculate its position in percent
        var posX = e.pageX - imgPosition.left,
          posY = e.pageY - imgPosition.top,
          percX = (posX / imgWidth) * 100,
          percY = (posY / imgHeight) * 100,
          perc = percX + "% " + percY + "%";

        if (started && !found && checkPosition(percX, percY)) {
          found = true
          endGame("win")
        }
        //Change CSS of magnifier, move it to mouse location and change background position based on the percentages stored.
        $(".magnifier").css({
          top: posY,
          left: posX,
          backgroundPosition: perc
        });
      });
    }

  }, function () {
    //Hide the magnifier when mouse is no longer hovering over image.
    $(".magnifier").hide();
  });

}

var checkPosition = (percX, percY) => {

  var mag_y = (percX * size.width) / 100;
  var mag_x = (percY * size.height) / 100;

  if (mag_x > position.x && mag_x < position.x + position.height &&
    mag_y > position.y && mag_y < position.y + position.width)
    return true

  return false
}


var updateObjectPosition = (imagem_missing_part, imagem_black_white) => {

  var rows = size.height - position.height
  var cols = size.width - position.width

  position.x = Math.floor(Math.random() * (rows + 1))//
  position.y = Math.floor(Math.random() * (cols + 1))//

  var x_inicial = position.x,
    y_inicial = position.y,
    x_final = position.x + position.width,
    y_final = position.y + position.height


  for (let x = x_inicial; x < x_final; x++) {
    for (let y = y_inicial; y < y_final; y++) {
      imagem_missing_part.ucharPtr(x, y)[0] = 255 //R
      imagem_missing_part.ucharPtr(x, y)[1] = 255 //G
      imagem_missing_part.ucharPtr(x, y)[2] = 255 //B
      imagem_missing_part.ucharPtr(x, y)[3] = 255 //A
    }
  }

}


var endGame = (tipo = "game-over") => {

  if (tipo == "game-over" && !found) {
    alert("Game-Over")
  }
  else {
    alert("CONGRATULATIONS! You get 10OFF in your next shopping! Use this code: " + getCouponDiscount())
  }

  started = false
  found = false
  clearInterval(contador)
  clearTimeout(contadorGameOver)
  $("#btnStart").removeAttr("hidden")
  $("#timer").attr("hidden", "hidden")
  document.getElementById("timer").textContent = "Resting 10 seconds!";

}


var getCouponDiscount = () => {

  var couponCode = "COUPON"

  for (let i = 0; i < 4; i++) {
    couponCode += Math.floor(Math.random() * (9 + 1))
  }

  return couponCode
}

//cronometro regressivo
var startTimer = () => {
  var seconds = 10
  contador = setInterval(() => {
    seconds = seconds < 10 ? "0" + seconds : seconds;
    document.getElementById("timer").textContent = "Resting " + seconds + " second(s)!";
    if (seconds-- < 0)
      seconds = 0
  }, 1000)

}

var onStartGame = () => {
  $("#btnStart").click(() => {

    onHoverCanvas()

    $("#btnStart").attr("hidden", "hidden")
    $("#timer").removeAttr("hidden")
    started = true;

    contadorGameOver = setTimeout(endGame, 11000)
    startTimer()

  })
}

var convertCanvasToImage64 = (canvasId = "") => {
  return document.getElementById(canvasId).toDataURL()
}

var updateImageElement = (imgId = "", canvasId = "") => {
  var imgElement = document.getElementById(imgId);
  imgElement.hidden = false
  imgElement.src = canvasId == "" ? canvasId : convertCanvasToImage64(canvasId)
  document.getElementsByClassName('magnified')[0].appendChild(imgElement)
}

var updateImageBackground = (elementId = "", canvasId = "") => {
  document.getElementById(elementId).style.backgroundImage = canvasId == "" ? canvasId : "url('" + convertCanvasToImage64(canvasId) + "')";
}


var loadImages = () => {
  
  //FAZ A LEITURA DA IMAGEM COM ID 'img' NO HTML
  let imagem_original = cv.imread('img')

  //CRIA UMA INSTANCIA DO TIPO DE IMAGEM ESPERADA
  imagem_black_white = new cv.Mat()
  imagem_missing_part = new cv.Mat()

  //OBTEM O HEIGHT E WIDTH DA IMAGEM
  size = imagem_original.size()

  //PRIMEIRA CONVERSÃO DE IMAGEM: black and white
  //convertendo a imagem src e jogando o resultado na variavel dst
  cv.cvtColor(imagem_original, imagem_black_white, cv.COLOR_RGB2GRAY, 0);

  //NO CASO DE QUERER FAZER UMA CÓPIA DA IMAGEM UTILIZE O METODO DE clone()
  imagem_missing_part = imagem_original.clone();

  //PARA MODIFICAR UM PEDAÇO DA FIGURA, DEFINA QUAL VAI SER A MODIFICAÇÃO E EM SEGUIDA AS CORES RGBA
  updateObjectPosition(imagem_missing_part)

  //PARA COLOCAR A IMAGEM EM UM CANVAS
  //PRIMEIRO PARAMETRO: ID DO CANVAS: canvasOutput
  //SEGUNDO PARAMETRO: IMAGEM GERADA: dst
  cv.imshow('canvasMissingOutput', imagem_missing_part);
  cv.imshow('canvasBlackWhiteOutput', imagem_black_white);

  imagem_original.delete(); imagem_black_white.delete(); imagem_missing_part.delete();

  //USADO PARA MUDAR A IMAGEM DE UMA TAG <img/> a partir de um canvas gerado
  updateImageElement("base_image", "canvasBlackWhiteOutput")
  updateImageBackground("magnifier", "canvasMissingOutput")

  //remove loader
  $(".lds-ring")[0].remove()
}


var init = () => {
  setInterval(loadImages, 5000);
  onStartGame()
}


document.addEventListener('DOMContentLoaded', function () {
  init()
})