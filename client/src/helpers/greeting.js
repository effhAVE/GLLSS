export default function(username) {
    const greetings = [
        `Hello ${username}, how are you?`,
        `Feeling inquisitive, huh?`,
        `Hey, you were not supposed to open the dev console!`
    ];

    return greetings[Math.floor(Math.random() * greetings.length)];
}