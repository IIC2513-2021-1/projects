/*
  You have access to MIN_STOCK here
  Change the value if you want to test different scenarios.
*/
const { MIN_STOCK } = require('../../lib/constants');

// PREGUNTA E

// Parte (a)

/* Puntaje: funciona sin problemas: 5 puntos*/
function retrieveElements(arrayMisc, arrayIndexes) {
  /* Write your solution here */
  let returnedArray = [];

  arrayIndexes.forEach((idx) => {
    returnedArray.push(arrayMisc[idx]);
  });

  return returnedArray;
}

// Seccion para comprobar, no era necesario entregarla
arrOrigin = ['a', 'b', 1, 2, 'j', 'k', 3, 5];
arrIdx = [1, 3, 5];
arrRet = retrieveElements(arrOrigin, arrIdx);
console.log('\n Resultado pregunta E.a ');
console.log(' -----------------------\n');
console.log(arrRet);

//parte b

/* Utiliza MIN_STOCK : 2 puntos
   Filtra por un stock y retorna correctamente la estrucutra y valores: 3 puntos
*/
let Store = [
  { item: 'Arroz 1Kg', marca: 'Miraflores', branch: 'Maipu', stock: 31 },
  { item: 'Aceite 1Lt', marca: 'Chef', branch: 'Maipu', stock: 17 },
  {
    item: 'Queso Laminado',
    marca: 'Quillayes',
    branch: 'Providencia',
    stock: 5,
  },
];

/* Puntaje: Filtra por brach y entrega valores correctos: 5 puntos.
NOTA: por un error en enunciado, si fitlra además por STOCK, la pregunta se considerrá correcta tambien.
*/
function checkStock(store) {
  /* Write your solution here */
  const MIN_STOCK = 10; // O utiliza la constante importada

  let minStock = [];

  store.forEach((item) => {
    if (item.stock < 10) {
      minStock.push(item);
    }
  });
  return minStock;
}

function itemsByBranch(store, branch) {
  /* Write your solution here */
  arrByBranch = [];

  store.forEach((item) => {
    if (item.branch == branch) {
      arrByBranch.push(item);
    }
  });
  return arrByBranch;
}

// Seccion para comprobar, no era necesario entregarla
console.log('\n Resultado pregunta E.b');
console.log(' -----------------------\n');
console.log('\n === Min Stock === \n');
lowStock = checkStock(Store);
console.log(lowStock);
console.log('\n === Items by branch === \n');
itemsBranch = itemsByBranch(Store, 'Maipu');
console.log(itemsBranch);

module.exports = {
  checkStock,
  itemsByBranch,
  retrieveElements,
};
