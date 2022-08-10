module.exports = (passwordLength = 10) => {
    // var length = (passwordLength)?(passwordLength):(10);
    var string = "abcdefghijklmnopqrstuvwxyz"; //to upper 
    var stringUppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; //to upper 
    var numeric = '0123456789';
    var punctuation = '@';
    var password = "";
    var character = "";
    while (password.length < passwordLength) {
        entity1 = Math.ceil(string.length * Math.random() * Math.random());
        entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
        entity3 = Math.ceil(punctuation.length * Math.random() * Math.random());
        entity4 = Math.ceil(stringUppercase.length * Math.random() * Math.random());
        // hold = string.charAt(entity1);
        // hold = (password.length % 2 == 0) ? (hold.toUpperCase()) : (hold);
        // character += hold;
        character += string.charAt(entity1);
        character += numeric.charAt(entity2);
        character += stringUppercase.charAt(entity4);
        character += punctuation;
        // character += punctuation.charAt(entity4);
        password = character;
    }
    password = password.split('').sort(function () { return 0.5 - Math.random() }).join('');
    return password.substr(0, passwordLength);
}