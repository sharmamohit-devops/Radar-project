#include <Servo.h>

// Define connection pins
const int trigPin = 9;
const int echoPin = 10;
const int servoPin = 11;
const int buzzerPin = 12; // Buzzer pin

// Define variables
long duration;
int distance;
int angle = 0; // Start at 0 degrees
int step = 1; // Move 1 degree at a time
bool movingClockwise = true; // Direction flag

// Detection parameters
const int detectionThreshold = 30; // Distance in cm to trigger buzzer (adjust as needed)
bool objectDetected = false;

Servo radarServo; // Create servo object

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(buzzerPin, OUTPUT); // Set buzzer pin as output
  radarServo.attach(servoPin);
  Serial.begin(9600); // Start serial communication
}

void loop() {
  
  // Move the servo to the current angle
  radarServo.write(angle);
  
  // Get distance measurement from ultrasonic sensor
  distance = calculateDistance();
  
  // Check if object is detected within threshold
  if (distance > 0 && distance < detectionThreshold) {
    objectDetected = true;
    tone(buzzerPin, 1000); // Sound buzzer at 1000Hz
  } else {
    objectDetected = false;
    noTone(buzzerPin); // Turn off buzzer
  }
  
  // Send data to Processing in the format: "angle,distance"
  Serial.print(angle);
  Serial.print(",");
  Serial.println(distance);
  
  // Calculate the next angle
  if (movingClockwise) {
    angle += step; // Increase the angle
  } else {
    angle -= step; // Decrease the angle
  }
  
  // Change direction when we hit the limits (0 or 180)
  if (angle >= 180) {
    movingClockwise = false; // Now move counter-clockwise
    angle = 180; // Ensure it doesn't exceed 180
  } 
  if (angle <= 0) {
    movingClockwise = true; // Now move clockwise
    angle = 0; // Ensure it doesn't go below 0
  }
  
  // Small delay for stability and to control sweep speed
  delay(30);
}

// Function to calculate distance
int calculateDistance() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.034 / 2;
  return distance;
}