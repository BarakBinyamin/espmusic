# ESP32 custom wireless speaker

A minimal server and sketch to get ok sound with one or many esp32+speakers

Much thanks to julianfschroeter for providing the [java version of this project](https://www.hackster.io/julianfschroeter/stream-your-audio-on-the-esp32-2e4661)

## Requirements
1. [An esp32 dev board](https://www.amazon.com/s?k=esp32+dev+board&crid=3CI4H0N9A2J4&sprefix=esp+dev+b%2Caps%2C118&ref=nb_sb_ss_ts-doa-p_1_9)
2. [A mini speaker](https://www.amazon.com/arduino-speaker/s?k=arduino+speaker)
3. [Mini amplifier](https://www.amazon.com/arduino-amplifier/s?k=arduino+amplifier)
4. [Arduino IDE](https://www.arduino.cc/en/software)
5. [Setup Arduino IDE for esp32](https://randomnerdtutorials.com/installing-the-esp32-board-in-arduino-ide-windows-instructions/)
6. [Node JS](https://nodejs.org/en)

## Quickstart
```bash
git clone espmusic
cd espmusic
```

1. Create a formatted wav file:
```bash
ffmpeg -i <input_file> -ar 32000 -ac 1 -acodec pcm_u8 <output_file.wav>
````
2. Get your ip address: open a terminal and type `ifconfig` or `ipconfig` and it will probably be near the word "inet"
3. Replace the wifi, password, and tcp_server in the [arduino sketch]()
4. Replace `PATH` with the path to your `<example.wav>` file in [index.js]()
5. Launch the music server, and upload the arduino sketch
```bash
node index.js #Launch the music server
```
