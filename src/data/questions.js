export const DOMAIN_QUESTIONS = {
  web_development: {
    title: 'Web Development',
    questions: [
      { id: 'q1', type: 'text', text: 'What frontend frameworks are you most comfortable with?' },
      { id: 'q2', type: 'textarea', text: 'Describe a web project you have built. What was the hardest part?' },
      { id: 'q3', type: 'url', text: 'Link to your GitHub profile or portfolio:' }
    ]
  },
  graphic_designing: {
    title: 'Graphic Design & Video Editing',
    questions: [
      { id: 'q1', type: 'text', text: 'Which software do you use? (e.g. Premiere Pro, After Effects, Illustrator)' },
      { id: 'q2', type: 'textarea', text: 'What is your primary design style?' },
      { id: 'q3', type: 'url', text: 'Link to your Behance, Dribbble, or Drive portfolio:' }
    ]
  },
  event_management: {
    title: 'Event Management',
    questions: [
      { id: 'q1', type: 'textarea', text: 'Have you organized any events in the past? Describe your role.' },
      { id: 'q2', type: 'textarea', text: 'How do you handle last-minute crises during an event?' }
    ]
  },
  automobile: {
    title: 'Automobile',
    questions: [
      { id: 'q1', type: 'text', text: 'What is your favorite engine configuration and why?' },
      { id: 'q2', type: 'textarea', text: 'Describe your experience with CAD software (SolidWorks, AutoCAD etc) or hands-on fabrication.' }
    ]
  },
  robotics: {
    title: 'Robotics / ML',
    questions: [
      { id: 'q1', type: 'text', text: 'What ML frameworks or Robotics platforms usually work with?' },
      { id: 'q2', type: 'textarea', text: 'Describe a project where you integrated hardware and software, or trained a model.' }
    ]
  }
};
