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
      { id: 'q5', type: 'textarea', text: 'Explain the function of any three tools you know in Photoshop.' },
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
      { id: 'q2', type: 'textarea', text: 'What are some commonly used sensors in robotics? Provide examples with applications.' },
      { id: 'q3', type: 'textarea', text: 'Explain the working principle of an ultrasonic sensor in obstacle detection.' },
      { id: 'q4', type: 'textarea', text: 'How can a robot recognize and follow a moving object?' },
      { id: 'q5', type: 'textarea', text: 'A line-following robot deviates from its path. What are possible reasons and fixes?' },
      { id: 'q6', type: 'textarea', text: 'How would you improve performance of a high-speed line-following robot?' },
      { id: 'q7', type: 'textarea', text: 'What sensors and algorithms are used in a self-balancing robot?' },
      { id: 'q8', type: 'textarea', text: 'Will a car moving at 5 m/s stop before hitting obstacle 2m ahead with 0.5s delay? Justify.' },
      { id: 'q9', type: 'textarea', text: 'What is the role of a motor driver with Arduino? Can it be eliminated?' },
      { id: 'q10', type: 'textarea', text: 'Calculate coverage width of ultrasonic sensor (30° angle at 50cm). Discuss significance.' }
    ]
  },

  machine_learning: {
    title: 'Machine Learning / AI',
    questions: [
      { id: 'q1', type: 'textarea', text: 'How would you replace -999 values in NumPy dataset with median? Why median over mean?' },
      { id: 'q2', type: 'textarea', text: 'How do you normalize image pixel values (0–255) to [0,1]? Why is it important?' },
      { id: 'q3', type: 'textarea', text: 'For 100-category feature, would you use one-hot encoding? What are alternatives?' },
      { id: 'q4', type: 'textarea', text: 'How do you merge two DataFrames keeping only common entries?' },
      { id: 'q5', type: 'textarea', text: 'How do you detect and handle outliers? Is approach different for tree models?' },
      { id: 'q6', type: 'textarea', text: 'Model has 90% train accuracy but 54% test accuracy. What problem? Solution?' },
      { id: 'q7', type: 'textarea', text: 'How would you preprocess categorical data like city and maintenance state?' }
    ]
  },

  automobile: {
    title: 'Automobile',
    questions: [
      { id: 'q1', type: 'text', text: 'What is the function of a differential gear?' },
      { id: 'q2', type: 'text', text: 'Why do vehicles use multiple gears?' },
      { id: 'q3', type: 'text', text: 'Why is first gear used while starting?' },
      { id: 'q4', type: 'text', text: 'Which mechanism is used in steering?' },
      { id: 'q5', type: 'text', text: 'Differentiate between petrol and diesel engines.' },
      { id: 'q6', type: 'text', text: 'Why does fuel efficiency decrease at high speed?' },
      { id: 'q7', type: 'text', text: 'What is a spoiler and its purpose?' },
      { id: 'q8', type: 'text', text: 'Disc brakes vs drum brakes – which is better and why?' },
      { id: 'q9', type: 'text', text: 'Bus vs car turning ability (same mass) – explain.' }
    ]
  },

  event_management: {
    title: 'Management',
    questions: [
      { id: 'q1', type: 'textarea', text: 'Tell us about yourself.' },
      { id: 'q2', type: 'textarea', text: 'Why do you want to join SAEINDIA and management domain?' },
      { id: 'q3', type: 'textarea', text: 'What makes you different from others?' },
      { id: 'q4', type: 'textarea', text: 'How will you ensure long-term commitment?' },
      { id: 'q5', type: 'textarea', text: 'Describe a team experience and your role.' },
      { id: 'q6', type: 'textarea', text: 'Are you in any other club? How will you prioritize?' },
      { id: 'q7', type: 'textarea', text: 'How will you handle conflicts in a team?' },
      { id: 'q8', type: 'textarea', text: 'How will you balance academics and club work?' },
      { id: 'q9', type: 'textarea', text: 'Event vs exam clash – what will you do?' },
      { id: 'q10', type: 'textarea', text: 'Propose a unique event idea and execution plan.' },
      { id: 'q11', type: 'textarea', text: 'Rate yourself (Teamwork, Leadership, Communication, Loyalty, Confidence, Honesty, Determination) with justification.' }
    ]
  }
};