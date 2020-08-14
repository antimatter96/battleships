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


const rowHeaders = ['/', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const colStarts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export { validateName, rowHeaders, colStarts }
