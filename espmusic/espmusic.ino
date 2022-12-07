#include <WiFi.h>

const char* WIFI = "WIFI";
const char* PASS = "PASSWORD";

WiFiClient client;

#define TCP_SERVER                  "192.168.4.141"
#define TCP_PORT                     8000
#define PACKET_SIZE                  6400

#define BUFFFERMAX                   32000
hw_timer_t * timer                 = NULL; 
portMUX_TYPE timerMux              = portMUX_INITIALIZER_UNLOCKED; 
uint8_t      dataBuffer[BUFFFERMAX];
int          readPointer           = 0;
int          writePointer          = 1;
bool         play = false;

int getAbstand() {
  int abstand = 0;
  if (readPointer < writePointer )      abstand =  BUFFFERMAX - writePointer + readPointer;
  else if (readPointer > writePointer ) abstand = readPointer - writePointer;
  return abstand;
}

void IRAM_ATTR onTimer() {
  portENTER_CRITICAL_ISR(&timerMux);
    if (play) {
      dacWrite(25, dataBuffer[readPointer]);
      readPointer++;
      if (readPointer == BUFFFERMAX) {
        readPointer = 0;
      }
      if ( getAbstand() == 0 ) {
        Serial.println("Buffer underrun!!!");
        play = false;
      }
    }
  portEXIT_CRITICAL_ISR(&timerMux);
}

void requestPacketAndFillBuffer(int abstand){
  if (client.connect(TCP_SERVER, TCP_PORT)){
      while (client.available() == 0);
      while (client.available() >= 1) {
        uint8_t value = client.read();
        dataBuffer[writePointer] = value;
        writePointer++;
        if (writePointer == BUFFFERMAX) writePointer = 0;
      }
      client.stop();
  }
  else{
     play=false;
     client.stop();
     Serial.write("\nWaiting for next packet...");
     delay(5000);
  }
}

void getnextPacketIfNeeded(){
  int abstand = getAbstand();
  if (abstand <= PACKET_SIZE){
    play = true;
  }
  if ( abstand >= PACKET_SIZE) {
    requestPacketAndFillBuffer(abstand);
  }
}

void connect_to_wifi(const char* ssid, const char* password){
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("");
  int stats = WiFi.status();
  int tries = 0;
  while (stats != WL_CONNECTED && stats != WL_CONNECT_FAILED && tries<20) {
    delay(500);
    Serial.print(".");
    tries++;
    stats = WiFi.status();
  }
  Serial.println("");
  if (stats == WL_CONNECTED){
    Serial.println("Connected to wifi...");
    return;
  }else{
    Serial.println("Failed to connect to wifi, tying again in 5 seconds...");
    delay(5000);
    connect_to_wifi(ssid,password);
  }
}

void setup() {
  Serial.begin(9600);
  connect_to_wifi(WIFI,PASS);
  
  // setup play buffer intterupt
  timer = timerBegin(0, 2, true); // use a prescaler of 2
  timerAttachInterrupt(timer, &onTimer, true);
  timerAlarmWrite(timer, 5000, true);
  timerAlarmEnable(timer);
}

void loop() {
  getnextPacketIfNeeded();
  // interupt activates every once and a while and play music
}
