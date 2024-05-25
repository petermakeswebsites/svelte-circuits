import Beep from '../../assets/beep.mp3?url'

const audio = globalThis.Audio ? new globalThis.Audio(Beep) : null

export function playBeep() {
	if (audio) {
		audio.currentTime = 0
		audio
			.play()
			.then(() => console.log('Audio played successfully'))
			.catch((error) => console.error('Error playing audio:', error))
	}
}
