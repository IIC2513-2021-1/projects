//PREGUNTA D (la más fácil de todas, no le cuenten a nadie..
/* Puntaje: Recorre y compara valores de ambas cadenas: 2 punto
            El objeto de retorno está bien formado: 3 punto
            funciona sin problemas y retorna los valores correctos 10 puntos
*/

//Nota, se asume que ambas cadenas son del mismo largo.
function isDNA(el1, el2) {
  arrDNA = ['A', 'G', 'C', 'T'];

  if (arrDNA.indexOf(el1) == -1 || arrDNA.indexOf(el2) == -1) return false;

  return true;
}

function checkDNA(originalString, finalString) {
  /* Write your solution here */
  let arrayMutation = [];

  for (index = 0; index < originalString.length; index++) {
    if (!isDNA(originalString[index], finalString[index]))
      return 'ERROR, invalid string';
    if (originalString[index] != finalString[index]) {
      mutation = {
        pos: index,
        original: originalString[index],
        mutation: finalString[index],
      };
      arrayMutation.push(mutation);
    }
  }
  return arrayMutation;
}

// Seccion para comprobar, no era necesario entregarla.

let str1 = 'TTGAMCTGAACGTCGAT';
let str2 = 'TTGACGTGAACGCCGAT';

arrayOfMutations = checkDNA(str1, str2);

console.log('\n Resultado pregunta D ');
console.log(' ---------------------\n');
console.log(arrayOfMutations);

module.exports = {
  checkDNA,
};
