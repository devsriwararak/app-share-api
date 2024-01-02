export function getNumberCode(originalString, increments, code) {
    // Extract numeric part and convert it to a number
    let numberCut = 1
    if(code === "HA" || code === "HM"){
        numberCut = 2
    }
    let numericPart = parseInt(originalString.substring(numberCut), 10);

    // Generate new data
    let newData = [];
    for (let i = 0; i < increments; i++) {
        numericPart++;
        let resultString = code + numericPart.toString().padStart(4, '0');
        newData.push(resultString);
    }

    return newData;
}