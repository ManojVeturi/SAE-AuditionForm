export const DOMAIN_QUESTIONS = {
  web_development: {
    title: 'Web Development',
    questions: [
      { id: 'q1', type: 'text', text: 'How do you change the background color of an element using CSS?' },
      { id: 'q2', type: 'text', text: 'How do you add an event listener to an element in JavaScript?' },
      { id: 'q3', type: 'text', text: 'What is responsive design?' },
      { id: 'q4', type: 'text', text: 'How do you create a link in HTML?' },
      { id: 'q5', type: 'text', text: 'How do you create a variable in JavaScript?' },
      { id: 'q6', type: 'text', text: 'What is a web browser?' },
      { id: 'q7', type: 'text', text: 'What is a URL?' },
      { id: 'q8', type: 'text', text: 'What is a web application?' },
      { id: 'q9', type: 'text', text: 'What is SEO (Search Engine Optimization)?' },
      { id: 'q10', type: 'text', text: 'What is CSS?' },
      { id: 'q11', type: 'text', text: 'How do you add an image in HTML?' }
    ]
  },

  graphic_designing: {
    title: 'Graphic Designing',
    questions: [
      { id: 'q1', type: 'text', text: 'What is the difference between raster and vector images?' },
      { id: 'q2', type: 'text', text: 'Name some tools you know in Photoshop.' },
      { id: 'q3', type: 'textarea', text: 'What are layers? Why are they important?' },
      { id: 'q4', type: 'textarea', text: 'What are smart objects and how are they useful?' },
      { id: 'q5', type: 'textarea', text: 'Explain function of three tools you know in Photoshop.' },
      { id: 'q6', type: 'textarea', text: 'How would you remove the background of an image in Photoshop?' },
      { id: 'q7', type: 'text', text: 'What are anchor points and paths?' },
      { id: 'q8', type: 'textarea', text: 'When would you use Photoshop instead of Illustrator?' },
      { id: 'q9', type: 'textarea', text: 'What is masking? Difference between layer mask and clipping mask?' },
      { id: 'q10', type: 'textarea', text: 'What is the difference between brightness/contrast and levels/curves?' }
    ]
  },

  video_editing: {
    title: 'Video Editing',
    questions: [
      { id: 'q1', type: 'text', text: 'What is frame rate (FPS), what is the standard frame rate, and when should you use high vs low FPS?' },
      { id: 'q2', type: 'text', text: '“What is a timeline, and how do you apply effects and delete unwanted parts of clips?”' },
      { id: 'q3', type: 'textarea', text: 'What is the difference between Adobe After Effects and Adobe Premiere Pro?' },
      { id: 'q4', type: 'textarea', text: 'What are keyframes? How do they create animation in Adobe After Effects?' },
      { id: 'q5', type: 'textarea', text: 'Difference between Gaussian blur and normal blur.' },
      { id: 'q6', type: 'textarea', text: 'What is masking in VFX? How do you track a mask to a moving object?' },
      { id: 'q7', type: 'text', text: 'What is color grading and how is it different from color correction?' },
      { id: 'q8', type: 'textarea', text: 'Name 3 tools you use most while editing and explain why.' },
      { id: 'q9', type: 'textarea', text: 'What is an audio transition? How do you smoothly connect two different audio clips?' },
      { id: 'q10', type: 'textarea', text: '“Is symmetry important in making a video look neat? If so why?”' }
    ]
  },

  robotics: {
    title: 'Robotics',
    questions: [
      { id: 'q1', type: 'textarea', text: 'What is a servo motor, and how does it differ from a stepper motor and BO motor?' },
      { id: 'q2', type: 'textarea', text: 'What are some commonly used sensors in robotics? Provide examples with their applications.' },
      { id: 'q3', type: 'textarea', text: 'Explain the working principle of an ultrasonic sensor in obstacle detection.' },
      { id: 'q4', type: 'textarea', text: 'Mention one method by which a robot can recognize and follow a moving object.' },
      { id: 'q5', type: 'textarea', text: 'A line-following robot using IR sensors starts deviating from its path. What could be the possible reasons, and how would you troubleshoot the issue?' },
      { id: 'q6', type: 'textarea', text: 'If you were to design a high-speed line-following robot, what modifications would you implement to improve performance and stability?' },
      { id: 'q7', type: 'textarea', text: 'For designing a self-balancing robot, which sensors and control algorithms would you use to minimize error?' },
      { id: 'q8', type: 'textarea', text: 'A self-driving car detects an obstacle 2 meters ahead using an ultrasonic sensor. The car is moving at 5 m/s, and the braking system has a response delay of 0.5 seconds. Will the car stop before hitting the obstacle? Justify your answer.' },
      { id: 'q9', type: 'textarea', text: 'An ultrasonic sensor has a detection angle of 30°. If the robot is placed 50 cm away from a wall, calculate the width of the area covered by the sensor at that distance. How does this affect the detection of narrow obstacles? Discuss its significance.' },
      { id: 'q10', type: 'textarea', text: 'An ultrasonic sensor has a detection angle of 30°. If the robot is placed 50 cm away from a wall, calculate the width of the area covered by the sensor at that distance. How does this affect the detection of narrow obstacles? Discuss its significance.' }
    ]
  },

  machine_learning: {
    title: 'Machine Learning / AI',
    questions: [
      { id: 'q1', type: 'textarea', text: 'A sensor dataset stored as a NumPy array contains missing values represented by -999. How would you replace these values with the median of the valid entries? Why might the median be preferred over the mean?' },
      { id: 'q2', type: 'textarea', text: 'Given a 2D NumPy array representing image pixel values (0–255), how would you normalize it to the range [0, 1]? What are the consequences of not normalizing before training a neural network?' },
      { id: 'q3', type: 'textarea', text: 'A categorical feature contains 100 unique categories. Would you use one-hot encoding? If not, what alternative techniques would you apply and why?' },
      { id: 'q4', type: 'textarea', text: 'You are given two DataFrames: df1 (customer IDs and purchases) and df2 (customer IDs and demographics). How would you merge them to retain only the common customers?' },
      { id: 'q5', type: 'textarea', text: 'How would you detect and handle extreme outliers in a dataset? Would your approach differ for tree-based models? Explain' },
      { id: 'q6', type: 'textarea', text: 'A model achieves 90% accuracy on training data but only 54% on testing data. What does this indicate, and how would you address it?' },
      { id: 'q7', type: 'textarea', text: 'You are given a house price dataset with: A column place (e.g., Kolkata, Delhi, Mumbai), A column maintenance_state (e.g., good, moderate, excellent, low). Would you directly feed this data into a machine learning model? If not, what preprocessing steps would you apply? Justify your approach.' }
    ]
  },

  automobile: {
    title: 'Automobile',
    questions: [
      { id: 'q1', type: 'text', text: 'What is the function of a differential gear in a vehicle?' },
      { id: 'q2', type: 'text', text: 'Why do vehicles use multiple gears instead of a single gear?' },
      { id: 'q3', type: 'text', text: 'Why is first gear used while starting a vehicle?' },
      { id: 'q4', type: 'text', text: 'Which mechanism is used in a vehicle’s steering system?' },
      { id: 'q5', type: 'text', text: 'Differentiate between petrol and diesel engines.' },
      { id: 'q6', type: 'text', text: 'Why does fuel efficiency decrease at very high speeds?' },
      { id: 'q7', type: 'text', text: 'What is a spoiler, and what is its purpose in a vehicle?' },
      { id: 'q8', type: 'text', text: 'Differentiate between disc brakes and drum brakes. Which is more efficient and why?' },
      { id: 'q9', type: 'text', text: 'If two vehicles (a bus and a car) have the same mass, which one will turn more easily and why?' }
    ]
  },

  event_management: {
    title: 'Management',
    questions: [
      { id: 'q1', type: 'textarea', text: 'Tell us about yourself.' },
      { id: 'q2', type: 'textarea', text: 'Why do you want to join SAEINDIA and specifically the management domain?' },
      { id: 'q3', type: 'textarea', text: 'What makes you different from other candidates, and what specific skills do you have that can contribute to the growth of the club?' },
      { id: 'q4', type: 'textarea', text: 'How will you ensure long-term commitment and active involvement in the club?' },
      { id: 'q5', type: 'textarea', text: 'Describe a situation where you worked in a team. What was your role and contribution?' },
      { id: 'q6', type: 'textarea', text: 'Are you currently a part of any other club? If yes, how will you prioritize your clubs?' },
      { id: 'q7', type: 'textarea', text: 'If you are leading a team during an event and face issues like lack of cooperation, conflicts between members, or someone not completing their assigned work, how would you handle the situation?' },
      { id: 'q8', type: 'textarea', text: 'How will you manage your club responsibilities alongside your academic workload?' },
      { id: 'q9', type: 'textarea', text: 'If a club event is scheduled on the same day as your exams, how would you handle the situation?' },
      { id: 'q10', type: 'textarea', text: 'If you are given responsibility to organize an event for SAEINDIA, propose a unique event idea and explain how you would plan and execute it successfully.' },
      { id: 'q11', type: 'textarea', text: 'Rate yourself out of 10 in the following areas and briefly justify your ratings:\n   - Teamwork\n   - Leadership\n   - Communication\n   - Loyalty\n   - Confidence\n   - Honesty\n   - Determination' }
    ]
  }
};