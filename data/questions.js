const QUESTIONS_PER_PAGE = 6;

const questions = [
  // PAGE 1 - Geography & Counties
  {
    id: 1, category: "Geography", reward: 45,
    question: "How many counties does Kenya have?",
    options: ["42 counties", "47 counties", "46 counties", "50 counties"],
    correctIndex: 1,
    explanation: "Kenya has 47 counties established under the 2010 Constitution."
  },
  {
    id: 2, category: "Geography", reward: 30,
    question: "Which is the largest county by area in Kenya?",
    options: ["Nairobi", "Turkana", "Marsabit", "Mandera"],
    correctIndex: 1,
    explanation: "Turkana County is the largest county in Kenya by land area."
  },
  {
    id: 3, category: "Geography", reward: 35,
    question: "Which lake is shared between Kenya, Uganda, and Tanzania?",
    options: ["Lake Turkana", "Lake Naivasha", "Lake Victoria", "Lake Baringo"],
    correctIndex: 2,
    explanation: "Lake Victoria is the largest lake in Africa and is shared by Kenya, Uganda, and Tanzania."
  },
  {
    id: 4, category: "Geography", reward: 40,
    question: "What is the capital city of Kenya?",
    options: ["Mombasa", "Kisumu", "Nairobi", "Nakuru"],
    correctIndex: 2,
    explanation: "Nairobi is the capital and largest city of Kenya."
  },
  {
    id: 5, category: "Geography", reward: 50,
    question: "Which mountain is the highest point in Kenya?",
    options: ["Mount Elgon", "Aberdare Range", "Mount Kenya", "Ol Doinyo Lengai"],
    correctIndex: 2,
    explanation: "Mount Kenya at 5,199 meters is the highest mountain in Kenya."
  },
  {
    id: 6, category: "Geography", reward: 60,
    question: "The Great Rift Valley runs through Kenya from which direction?",
    options: ["East to West", "North to South", "Northeast to Southwest", "Northwest to Southeast"],
    correctIndex: 1,
    explanation: "The Great Rift Valley runs roughly north to south through Kenya."
  },

  // PAGE 2 - History & Government
  {
    id: 7, category: "History", reward: 35,
    question: "In which year did Kenya gain independence from Britain?",
    options: ["1960", "1961", "1963", "1965"],
    correctIndex: 2,
    explanation: "Kenya gained independence on December 12, 1963, now celebrated as Jamhuri Day."
  },
  {
    id: 8, category: "History", reward: 40,
    question: "Who was Kenya's first President?",
    options: ["Daniel Arap Moi", "Jomo Kenyatta", "Oginga Odinga", "Tom Mboya"],
    correctIndex: 1,
    explanation: "Jomo Kenyatta was Kenya's first President, serving from 1964 to 1978."
  },
  {
    id: 9, category: "Government", reward: 45,
    question: "What is the name of Kenya's national assembly lower house?",
    options: ["Senate", "Cabinet", "National Assembly", "County Assembly"],
    correctIndex: 2,
    explanation: "The National Assembly is the lower house of Kenya's bicameral Parliament."
  },
  {
    id: 10, category: "Government", reward: 55,
    question: "Under Kenya's constitution, how long is a presidential term?",
    options: ["4 years", "5 years", "6 years", "7 years"],
    correctIndex: 1,
    explanation: "A presidential term in Kenya is 5 years, and a president can serve a maximum of two terms."
  },
  {
    id: 11, category: "History", reward: 65,
    question: "The Mau Mau uprising was primarily a resistance against which colonial power?",
    options: ["France", "Germany", "Britain", "Portugal"],
    correctIndex: 2,
    explanation: "The Mau Mau uprising (1952-1960) was a rebellion against British colonial rule."
  },
  {
    id: 12, category: "Government", reward: 50,
    question: "Which year was Kenya's current constitution promulgated?",
    options: ["2008", "2009", "2010", "2012"],
    correctIndex: 2,
    explanation: "Kenya's Constitution of 2010 was promulgated on August 27, 2010."
  },

  // PAGE 3 - Culture & Society
  {
    id: 13, category: "Culture", reward: 30,
    question: "What is the national language of Kenya?",
    options: ["English", "Swahili", "Luo", "Kikuyu"],
    correctIndex: 1,
    explanation: "Swahili (Kiswahili) is Kenya's national language, while English is the official language."
  },
  {
    id: 14, category: "Culture", reward: 35,
    question: "What does 'Harambee' mean in Swahili?",
    options: ["Independence", "Pulling together", "Freedom", "Unity"],
    correctIndex: 1,
    explanation: "Harambee means 'pulling together' and is Kenya's national motto."
  },
  {
    id: 15, category: "Culture", reward: 45,
    question: "Which ethnic community is associated with the Maasai Mara reserve area?",
    options: ["Kikuyu", "Luo", "Maasai", "Kalenjin"],
    correctIndex: 2,
    explanation: "The Maasai people have traditionally inhabited the Maasai Mara area."
  },
  {
    id: 16, category: "Culture", reward: 40,
    question: "Ugali is a staple food in Kenya made from which ingredient?",
    options: ["Rice flour", "Wheat flour", "Maize flour", "Sorghum flour"],
    correctIndex: 2,
    explanation: "Ugali is made from maize (corn) flour and is a staple across Kenya."
  },
  {
    id: 17, category: "Culture", reward: 55,
    question: "Which traditional Kikuyu musical instrument produces sound by plucking?",
    options: ["Drum", "Litungu", "Gicandi", "Wandindi"],
    correctIndex: 2,
    explanation: "The Gicandi is a traditional Kikuyu instrument, though the Litungu is a Luyha lyre."
  },
  {
    id: 18, category: "Culture", reward: 50,
    question: "What is the traditional Maasai jumping dance called?",
    options: ["Chakacha", "Adumu", "Ohangla", "Giriama"],
    correctIndex: 1,
    explanation: "Adumu is the traditional Maasai jumping dance performed by young warriors."
  },

  // PAGE 4 - Economy & Business
  {
    id: 19, category: "Economy", reward: 40,
    question: "Which cash crop is Kenya's leading export earner?",
    options: ["Coffee", "Tea", "Flowers", "Cotton"],
    correctIndex: 1,
    explanation: "Tea is Kenya's largest export earner, with Kenya being among the world's top tea producers."
  },
  {
    id: 20, category: "Economy", reward: 45,
    question: "What is the name of Kenya's mobile money service by Safaricom?",
    options: ["Airtel Money", "M-Pesa", "T-Kash", "MobiKash"],
    correctIndex: 1,
    explanation: "M-Pesa, launched in 2007, is Safaricom's mobile money transfer service."
  },
  {
    id: 21, category: "Economy", reward: 60,
    question: "The Nairobi Securities Exchange is located in which area of Nairobi?",
    options: ["Westlands", "Karen", "Upper Hill", "Industrial Area"],
    correctIndex: 2,
    explanation: "The Nairobi Securities Exchange (NSE) is located in Upper Hill, Nairobi."
  },
  {
    id: 22, category: "Economy", reward: 50,
    question: "Kenya's currency is called the Kenya Shilling. What is its symbol?",
    options: ["KES", "KSh", "Both KES and KSh are used", "Ksh only"],
    correctIndex: 2,
    explanation: "Both KES (international code) and KSh (local symbol) are used for the Kenya Shilling."
  },
  {
    id: 23, category: "Economy", reward: 70,
    question: "Silicon Savannah refers to Kenya's growing tech hub in which city?",
    options: ["Mombasa", "Kisumu", "Nairobi", "Nakuru"],
    correctIndex: 2,
    explanation: "Nairobi is called Silicon Savannah due to its thriving technology and startup ecosystem."
  },
  {
    id: 24, category: "Economy", reward: 55,
    question: "Which port city is Kenya's main gateway for imports and exports?",
    options: ["Malindi", "Lamu", "Mombasa", "Kilifi"],
    correctIndex: 2,
    explanation: "Mombasa Port is East Africa's largest seaport and Kenya's main trade gateway."
  },

  // PAGE 5 - Sports & Athletics
  {
    id: 25, category: "Sports", reward: 35,
    question: "In which year did Eliud Kipchoge break the 2-hour marathon barrier?",
    options: ["2017", "2018", "2019", "2020"],
    correctIndex: 2,
    explanation: "Eliud Kipchoge ran 1:59:40 in Vienna on October 12, 2019 (unofficial record)."
  },
  {
    id: 26, category: "Sports", reward: 40,
    question: "What is Kenya's national football team called?",
    options: ["Super Eagles", "Harambee Stars", "Simba FC", "Safari Lions"],
    correctIndex: 1,
    explanation: "Kenya's national football team is called Harambee Stars."
  },
  {
    id: 27, category: "Sports", reward: 50,
    question: "Which Kenyan athlete won the 800m gold at the 2012 London Olympics?",
    options: ["Wilson Kipketer", "David Rudisha", "Noah Ngeny", "Alfred Kirwa Yego"],
    correctIndex: 1,
    explanation: "David Rudisha won the 800m gold at London 2012, also setting a world record of 1:40.91."
  },
  {
    id: 28, category: "Sports", reward: 45,
    question: "Kenya's Rift Valley region is known for producing elite runners. Which county is called the 'home of champions'?",
    options: ["Uasin Gishu", "Nandi", "Elgeyo-Marakwet", "Kericho"],
    correctIndex: 1,
    explanation: "Nandi County is widely referred to as the 'home of champions' for producing world-class runners."
  },
  {
    id: 29, category: "Sports", reward: 60,
    question: "The Safari Rally, held in Kenya, is part of which international motorsport championship?",
    options: ["Formula One", "World Rally Championship", "Dakar Rally", "Africa Rally Cup"],
    correctIndex: 1,
    explanation: "The Safari Rally Kenya is part of the FIA World Rally Championship (WRC)."
  },
  {
    id: 30, category: "Sports", reward: 55,
    question: "Which stadium is the home of Kenya's national football team in Nairobi?",
    options: ["City Stadium", "Kasarani Stadium", "Nyayo National Stadium", "Bukhungu Stadium"],
    correctIndex: 2,
    explanation: "Nyayo National Stadium is the primary venue for Kenya's national football team."
  },

  // PAGE 6 - Environment & Wildlife
  {
    id: 31, category: "Wildlife", reward: 40,
    question: "Which Kenyan national park is famous for the annual wildebeest migration?",
    options: ["Amboseli", "Tsavo East", "Maasai Mara", "Lake Nakuru"],
    correctIndex: 2,
    explanation: "The Maasai Mara hosts the spectacular annual wildebeest migration from Tanzania's Serengeti."
  },
  {
    id: 32, category: "Wildlife", reward: 45,
    question: "What is the name of Kenya's flagship anti-poaching initiative?",
    options: ["Operation Ivory", "Northern Rangelands Trust", "Kenya Wildlife Service", "Big Five Guard"],
    correctIndex: 2,
    explanation: "The Kenya Wildlife Service (KWS) is the government agency managing wildlife conservation and anti-poaching."
  },
  {
    id: 33, category: "Environment", reward: 55,
    question: "The Wangari Maathai Institute is named after Kenya's Nobel Peace Prize winner. What year did she win the prize?",
    options: ["2000", "2002", "2004", "2006"],
    correctIndex: 2,
    explanation: "Wangari Maathai won the Nobel Peace Prize in 2004 for her contribution to sustainable development."
  },
  {
    id: 34, category: "Wildlife", reward: 50,
    question: "Which endangered rhino subspecies is found at Ol Pejeta Conservancy in Kenya?",
    options: ["Black rhino", "White rhino", "Northern white rhino", "Indian rhino"],
    correctIndex: 2,
    explanation: "Ol Pejeta hosts the last two northern white rhinos in the world."
  },
  {
    id: 35, category: "Environment", reward: 65,
    question: "Lake Nakuru is famous for which bird species?",
    options: ["Eagles", "Flamingos", "Pelicans", "Storks"],
    correctIndex: 1,
    explanation: "Lake Nakuru is famous for its flocks of flamingos, though numbers have varied with water levels."
  },
  {
    id: 36, category: "Wildlife", reward: 70,
    question: "What percentage of Kenya's land is protected as national parks and reserves?",
    options: ["5%", "8%", "12%", "20%"],
    correctIndex: 2,
    explanation: "Approximately 12% of Kenya's land area is protected as national parks, reserves, and sanctuaries."
  },

  // PAGE 7 - Education & Health
  {
    id: 37, category: "Education", reward: 45,
    question: "What does CBC stand for in Kenya's education system?",
    options: ["Central Based Curriculum", "Competency Based Curriculum", "Community Based Curriculum", "County Based Curriculum"],
    correctIndex: 1,
    explanation: "CBC stands for Competency Based Curriculum, introduced in Kenya to replace the 8-4-4 system."
  },
  {
    id: 38, category: "Education", reward: 50,
    question: "Which is Kenya's oldest and largest public university?",
    options: ["Kenyatta University", "Moi University", "University of Nairobi", "Jomo Kenyatta University"],
    correctIndex: 2,
    explanation: "The University of Nairobi, founded in 1956, is Kenya's oldest and largest public university."
  },
  {
    id: 39, category: "Health", reward: 60,
    question: "What is the government health insurance scheme in Kenya called?",
    options: ["NHIF", "SHIF", "NSSF", "Jubilee Health"],
    correctIndex: 0,
    explanation: "NHIF (National Hospital Insurance Fund) is Kenya's government health insurance scheme, being transitioned to SHIF."
  },
  {
    id: 40, category: "Health", reward: 100,
    question: "Which Kenyan institution is responsible for regulating pharmaceutical drugs and medical devices?",
    options: ["MOH", "KEBS", "KEPHIS", "PPB"],
    correctIndex: 3,
    explanation: "The Pharmacy and Poisons Board (PPB), now called KEBS pharmacy division, regulates pharmaceuticals in Kenya."
  },
];

module.exports = { questions, QUESTIONS_PER_PAGE };