// PREGUNTA F (numeros amistosos)

/* Puntaje: No considera amistoso a un dígito par: 1 punto
No considera amistoso a un numero terminado en cero: 1 punto
No Considera amistoso a un numero que no cumpla con el intercalado de un digito 0 enre dos digitos impares: 10 puntos
Retorna la estructura solicitada: 3 puntos
*/

function isOdd(number) {
  return number % 2 == 0 ? false : true;

  /* tambien es válido:
  if(number%2 == 0)
    return false;
  else 
    return true;
 */
}

function isDigitOk(toggle, digit) {
  if (toggle == 0 && digit == 0) return true;
  else if (toggle == 1 && isOdd(parseInt(digit))) {
    return true;
  }

  return false;
}

function isFriendly(arrayNumbers) {
  /* Write your solution here */
  arrFiendlyNumbers = [];
  arrayNumbers.forEach((number) => {
    let toggle = 1;
    let friendly = true;

    if (number % 2 == 0) {
      arrFiendlyNumbers.push({ friendly: false, number: number });
    } else {
      num = number.toString();
      numberStr = [...num];
      for (i = 0; i < numberStr.length; i++) {
        digit = numberStr[i];

        if (isDigitOk(toggle, digit)) {
          toggle = toggle == 0 ? 1 : 0;
        } else {
          arrFiendlyNumbers.push({ friendly: false, number: number });
          friendly = false;
          break;
        }
      }
      if (friendly) arrFiendlyNumbers.push({ friendly: true, number: number });
    }
  });

  return arrFiendlyNumbers;
}

// Seccion para comprobar, no era necesario entregarla
console.log('\n Resultado pregunta F ');
console.log(' ---------------------\n');
myArray = [305010305, 70201, 130705, 103070, 909];

arrCheckFriendly = isFriendly(myArray);
console.log(arrCheckFriendly);

module.exports = {
  isFriendly,
};
