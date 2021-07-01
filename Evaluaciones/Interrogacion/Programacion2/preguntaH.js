const { callTest, getSample } = require('../../lib/mars');
const {
  MIN_WEIGHT_A,
  MIN_WEIGHT_B,
  MIN_WEIGHT_D,
} = require('../../lib/constants');

/* Rúbrica. esta pregunta entrega un total de 20 puntos.

El puntaje va entre paréntesis cuadrados, antes de cada criterio:

- [4 puntos total] Enfrenta el problema trabajando con promesas y/o async/await y secuencializando la ejecución.

- [10 puntos total] Implementa adecuadamente el flujo de la aplicación de tests, entregando  salidas, armando estrcuturas,
                    controlando los flujos de codigos y de errores. se dan 2 puntos por cada función correctamente 
                    implementada (applyTestA , applyTestB, applyTestC y applyTestD y splitSample

- [6 puntos total] Entrega los mensajes y la estructura de salida como solicitado en el enunciado (un arreglo de objetos que
                   indica el resultado de cada prueba ejecutada de acuerdo al proceso o NA de no aplicar) Debe implementar y 
                   funcionar para los casos dados en el flujo, por ejemplo reaccionar bien a los codigos 201 o 301 que entrega
                   applyTestA, y asi sucesivamente.
*/

/*
  Se pueden cambiar los valores de las siguientes variables en lib/constants.js
  De este modo se pueden probar diferentes resultados
  Un caso de prueba:

  const SAMPLE_CODE = 100;
  const TEST_ARRAY_RESULTS = [201, 'type-G', 201, '1010'];
*/

/* Implementación de splitSample(). Acá había decisiones de diseño en lo que debía retornar. 
   No había ninguna indicación en particular, es libre de retornar codigos de error, mensajes de error y de exitos, etc.
   Lo relevante y obligatorio era devolver el sampleSet.
*/

function splitSample() {
  /* Write your solution here */
  let exito = true; //Para efectos de test

  sampleSet = [
    { sample: 'A', weight: 123, slot: 1 },
    { sample: 'B', weight: 111, slot: 2 },
    { sample: 'C', weight: 113, slot: 3 },
    { sample: 'D', weight: 221, slot: 4 },
  ];

  return new Promise((resolve, reject) => {
    if (exito) resolve(sampleSet);
    else console.error('Error en splitSample');
    reject('FAILED while splitting sample');
  });
}

async function applyTestA(values) {
  /* Write your solution here */
  const MIN_WEIGHT_A = 100; // O utiliza la constante importada

  let errorMsg = [
    { test: 'A', result: 901 },
    { test: 'B', result: 'NA' },
    { test: 'C', result: 'NA' },
    { test: 'D', result: 'NA' },
  ];

  if (values[0].weight < MIN_WEIGHT_A) {
    return new Promise((resolve, reject) => {
      console.log(
        'The sample A weight is less than that required to run the test'
      );
      reject(errorMsg);
    });
  } else {
    status = await callTest(0, values[0].weight, values[0].slot);

    return new Promise((resolve, reject) => {
      /* En este caso el truco era crear una forma en que la información "viajase" entre los diferentes test y fuese
        "guardando" la historia. en este caso, se creó una estructura que guarda el status de ejecución retornado 
        por callTest junto con "sampleTest" y la creacion de un arreglo que guarda el historial de ejecución para 
        luego imprimirlo al final de la ejecución del programa.
      */

      if (status == 201 || status == 301) {
        arrFinal = [];
        arrFinal[0] = { test: 'A', result: status };

        let returnedVal = {
          statusCode: status,
          arrayVals: values,
          finalStatus: arrFinal,
        };
        resolve(returnedVal);
      } else {
        reject(errorMsg);
      }
    });
  }
}

async function applyTestB(values) {
  /* Write your solution here */
  const MIN_WEIGHT_B = 107; // O utiliza la constante importada

  if (values.arrayVals[1].weight < MIN_WEIGHT_B) {
    return new Promise((resolve, reject) => {
      console.log(
        'The sample B weight is less than that required to run the test'
      );
      returnedMsg = [
        { test: 'A', result: values.finalStatus[0].result },
        { test: 'B', result: 901 },
        { test: 'C', result: 'NA' },
        { test: 'D', result: 'NA' },
      ];
      reject(returnedMsg);
    });
  } else {
    status = await callTest(
      1,
      values.arrayVals[1].weight,
      values.arrayVals[1].slot
    );

    return new Promise((resolve, reject) => {
      values.finalStatus.push({ test: 'B', result: status });
      values.finalStatus.push({ test: 'C', result: 'NA' });
      values.statusCode = status;
      resolve(values);
    });
  }
}

async function applyTestC(values) {
  /* Write your solution here */
  status = await callTest(
    2,
    values.arrayVals[2].weight,
    values.arrayVals[2].slot
  );

  return new Promise((resolve, reject) => {
    if (status == 201) {
      console.log('Falso negativo \n');
      values.statusCode = 999;
      arrFinal.push({ test: 'B', result: 'NA' });
      values.finalStatus.push({ test: 'C', result: 999 });
      resolve(values);
    } else {
      console.log("Muestras Negativas \n'");
      returnedMsg = [
        { test: 'A', result: values.finalStatus[0].result },
        { test: 'B', result: 'NA' },
        { test: 'C', result: 900 },
        { test: 'D', result: 'NA' },
      ];
      reject(returnedMsg);
    }
  });
}

async function applyTestD(values) {
  /* Write your solution here */
  const MIN_WEIGHT_D = 101; // O utiliza la constante importada

  if (values.arrayVals[3].weight < MIN_WEIGHT_D) {
    return new Promise((resolve, reject) => {
      console.log(
        'The sample D weight is less than that required to run the test'
      );
      returnedMsg = [
        { test: 'A', result: values.finalStatus[0].result },
        { test: 'B', result: values.finalStatus[1].result },
        { test: 'C', result: values.finalStatus[2].result },
        { test: 'D', result: 901 },
      ];
      reject(returnedMsg);
    });
  } else {
    status = await callTest(
      3,
      values.arrayVals[3].weight,
      values.arrayVals[3].slot
    );

    return new Promise((resolve, reject) => {
      values.statusCode = status;
      values.finalStatus.push({ test: 'D', result: status });
      resolve(values);
    });
  }
}

/* Imprime el resultado final, es decir la estrucutra con todos los resultados de los tests.
   Adicionalmente imprime la salida del testD segpun señala el enunciado.
*/

function printFinalResults(data) {
  console.log('Final report: \n');
  console.log(data.finalStatus);
  valTestD = data.finalStatus[3].result;
  valTestB = data.finalStatus[1].result;

  if (valTestD == '0000') {
    console.log('Not evidence found');
  } else if (valTestD == '0101') {
    console.log('Weak evidence');
  } else if (valTestD == '1001' && valTestB == 'type-G') {
    console.log('Proceed with further tests in other selected areas');
  } else if (valTestD == '1001' && valTestB == 'type-H') {
    console.log('Positive outcome, proceed with further test on site');
  } else console.log('unexpected result');
}

//Esta es la funcion que provoca que "ocurra todo"
function performExperiment() {
  /* Write your solution here */
  /* You need to use the above functions here */
  getSample()
    .then(() => splitSample())
    .then((returnedValue) => applyTestA(returnedValue))
    .then((retValA) => {
      if (retValA.statusCode == 201) {
        applyTestB(retValA)
          .then((retValB) => applyTestD(retValB))
          .then((retValD) => printFinalResults(retValD))
          .catch(console.error);
      }
      if (retValA.statusCode == 301) {
        applyTestC(retValA)
          .then((retValC) => applyTestD(retValC))
          .then((retValD) => printFinalResults(retValD))
          .catch(console.error);
      }
    })
    .catch(console.error);
}

module.exports = {
  applyTestA,
  applyTestB,
  applyTestC,
  applyTestD,
  performExperiment,
  splitSample,
};
