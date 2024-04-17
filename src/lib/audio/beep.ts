import Beep from "../../assets/beep.mp3?url"
// Create a new audio object and point it to the URL of the sound file
const audio = new Audio(Beep)

// Function to play the sound
export function playBeep() {
    audio.currentTime = 0
	audio
		.play()
		.then(() => console.log('Audio played successfully'))
		.catch((error) => console.error('Error playing audio:', error))
}
    