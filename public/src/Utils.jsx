//

function validateName(name) {
  if (name === undefined || name === null) {
    return new Error("Too Short. Minimum 5 characters");
  }
  if (name.length < 5) {
    return new Error("Too Short. Minimum 5 characters");
  }
  if (name.length > 255) {
    return new Error("Too Long. Maximum 255 characters");
  }
  if (/^\w+$/.test(name)) {
    return true;
  }
  return new Error("Please Choose alphabets, numbers or '_'");
}

function joinSets(setA, setB) {
  let a = [...setA];
  let b = [...setB];

  a.push(...b);
  return a;
}

function setIntersection(setA, setB) {
  let _intersection = new Set()
  for (let elem of setB) {
    if (setA.has(elem)) {
      _intersection.add(elem)
    }
  }
  return _intersection
}

const ships = [
  { st: 'A', name: 'Carrier (5)' },
  { st: 'B', name: 'Submarine (4)' },
  { st: 'C', name: 'Destroyer (3)' },
  { st: 'D', name: 'Cruiser (3)' },
  { st: 'E', name: 'Patrol (2)' }
]

const lengthOfType = { A: 5, B: 4, C: 3, D: 3, E: 2 };
const rowHeaders = ['/', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const colStarts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const arrOfI = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const arrOfJ = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];


export {
  validateName,
  rowHeaders,
  colStarts,
  lengthOfType,
  arrOfI,
  arrOfJ,
  ships,
  joinSets,
  setIntersection,
}
