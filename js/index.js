// fetch countries, firstnames, and lastnames from the very long arrays (located at bottom of the file)
const countries = countryList()
const firstNames = firstNameList()
const lastNames = lastNameList()

// applicants image element
const applicantEl = document.getElementById("avatar")
// applicants passport element
const passportEl = document.getElementById("passport")
// applicants application element
const applicationEl = document.getElementById("application")

/*** button event handlers: ***/

// handle next button event
const buttonNext = document.getElementById("button-next")
buttonNext.onclick = () => callNextPerson() // removed queue[0] from here because we only handle the click event itself here, not the data
// handle decline button event
const declineButton = document.getElementById("decline")
declineButton.onclick = () => handleCurrentPerson("declined")
// handle approve button event
const approveButton = document.getElementById("approve")
approveButton.onclick = () => handleCurrentPerson("approved")

/* global variables */
const queue = [] // the queue stores objects of people in the queue
const today = new Date().toLocaleDateString("NO-no") // store todays date

let currentApplicant = null // changed from number to null (when none) or object when a person is being handled
// gamestats, combines approved/declined-Count, and other stats
const gameStats = {
  approved: [], // array of objects of people that were approved
  declined: [], // array of objects of people that were declined
  mistakes: [], // array of objects of people that were mistakenly approved or declined
  // return approved and declined count combined
  processed() {
    return this.approved.length + this.declined.length
  },
  // returns accuracy as value between 0.0 to 1.0
  accuracy() {
    // if there is any processed data then calculate and return the accuracy, or else return 1.0
    return this.processed() ? 1.0 - this.mistakes.length / this.processed() : 1.0
  }
}

// starts the game
startGame()

// start game generates a queue of random people
function startGame() {
  // generate a queue of between 5-10 random people
  for (let i = 1; i <= randomInt(10,5); i++) { // start i at 1 instead of 0
    queue.push(createPerson(i)) // send i (we use it as 'id' in the person object)
  }
  displayQueueAndStats()
}

// runs when the queue is empty
function gameOver() {
  const footerElement = document.querySelector("footer")
  footerElement.innerHTML = `<h1 style="text-align: center; color: #fff; font-size: 2rem; position: static;">Game over!</h1><h2 style="color: #0f8;">Refresh the page to play again.</h2>`;
  console.log(gameStats)
}

// returns a new random person
function createPerson(id) { // renamed function name to createPerson to better reflect what it does

  // function takes 2 params, a default value and a randomvalue, and returns one of these based on a RNG
  function generateData(defaultValue, randomValue) {
    return (randomInt(11) > 9) ? randomValue : defaultValue
  }
  // can also be written as a oneline arrow function:
  // const generateData = (defaultValue, randomValue) => (randomInt(11) > 9) ? randomValue : defaultValue

  // generate personal data
  const avatar = randomInt(999)
  const passport = {
    photo: generateData(avatar, randomInt(999)),
    name: randomName(),
    born: randomDate(1970, 2010),
    country: randomCountry(),
    expirationDate: randomDate(2018, 2030)
  }
  const application = {
    photo: generateData(avatar, randomInt(999)),
    name: generateData(passport.name, randomName()),
    born: generateData(passport.born, randomDate(1970, 2010)),
    country: generateData(passport.country, randomCountry()),
    entryDate: generateData(today, randomDate(2018, 2030))
  }
  const entryIssues = [] // replaces goodForEntry boolean var. An empty array means they're good for entry, otherwise all issues will be stored here.
 
  return {
    id,
    avatar,
    passport,
    application,
    entryIssues
  }
}

// display queue and stats numbers
function displayQueueAndStats() {

  // queue display elements
  const queueLeftEl = document.getElementById("queue-left")
  const queueCurrentEl = document.getElementById("queue-current")
  const queueDoneEl = document.getElementById("queue-processed")

  queueLeftEl.textContent = queue.length
  queueCurrentEl.textContent = currentApplicant?.id
  queueDoneEl.textContent = gameStats.processed()

  // stats elements:
  const approvedCountEl = document.getElementById("approved")
  const declinedCountEl = document.getElementById("declined")
  const accuracyEl = document.getElementById("accuracy")

  approvedCountEl.textContent = gameStats.approved.length
  declinedCountEl.textContent = gameStats.declined.length
  // display accuracy as percentage, with 2 decimals
  accuracyEl.textContent = (gameStats.accuracy()*100).toFixed(2) + "%"
}

// handle next person
function callNextPerson() {
  // if the counter is busy with just terminate the function early with a if (condition) return
  if (currentApplicant) return
  // if there are no more people in the queue then the game is over
  if (!queue.length) return gameOver()

  // first handle the "business logic"
  const [person] = queue.splice(0,1) // remove the first person in the queue and store them in a variable, the [] is necessary because splice returns an array with just 1 element
  const entryIssues = checkEntryIssues(person) // check this person for entry issues
  // set current applicant to data from person and add entry issues. Reason to write ...person instead of person is because person is an array, we just want the data from the array not the array structure
  currentApplicant = {...person, entryIssues} // set current applicant to this persons id

  // finally display/render the data on the page
  showPerson(currentApplicant.avatar)
  showPassport(currentApplicant.passport)
  showApplication(currentApplicant.application)
  displayQueueAndStats()
}

// check the person for entry issues, returns an array of issues (if any)
function checkEntryIssues({avatar, passport, application}) {
  const entryIssues = []
  if (avatar !== passport.photo) entryIssues.push("Passport photo doesn't match avatar")
  if (application.photo !== passport.photo) entryIssues.push("Passport photo doesn't match application photo")
  if (avatar !== application.photo) entryIssues.push("Application photo doesn't match avatar")
  if (passport.name !== application.name) entryIssues.push("Name mismatch")
  if (passport.born !== application.born) entryIssues.push("Date of birth mismatch")
  if (passport.country !== application.country) entryIssues.push("Country mismatch")
  if (daysBetweenDates(application.entryDate, today) < 0 ) entryIssues.push("Date of entry is earlier than today")
  if (daysBetweenDates(passport.expirationDate, today) < 0) entryIssues.push("Passport is expired")

  return entryIssues
}

// displays the person standing infront of the counter
function showPerson(image) {
  // update avatar image
  applicantEl.src = photoUrl(image)
  // run the css transition by changing classname
  applicantEl.className = "atdesk"
}

// displays passport data
function showPassport({photo, name, born, country, expirationDate}) {
  // passport elements:
  const passNameEl = document.getElementById("name-pass")
  const passBornEl = document.getElementById("born-pass")
  const passCountryEl = document.getElementById("country-pass")
  const passExpiresEl = document.getElementById("valid-pass-date")
  const passPhotoEl = document.getElementById("photo-pass") 

  // update passport elements
  passPhotoEl.src = photoUrl(photo)
  passNameEl.textContent = name
  passBornEl.textContent = born
  passCountryEl.textContent = country
  passExpiresEl.textContent = expirationDate
  // run the css transition by changing classname
  passportEl.className = "passport-ondesk"
}

// display application data
function showApplication({photo, name, born, country, entryDate}) {
  // application form elements:
  const appPhotoEl = document.getElementById("photo-application")
  const appNameEl = document.getElementById("name-application")
  const appBornEl = document.getElementById("born-application")
  const appCountryEl = document.getElementById("country-application")
  const appEntryDateEl = document.getElementById("entry-date-application")

  // update application form elements:
  appPhotoEl.src = photoUrl(photo)
  appNameEl.textContent = name
  appBornEl.textContent = born
  appCountryEl.textContent = country
  appEntryDateEl.textContent = entryDate
  // run the css transition by changing classname
  applicationEl.className = "application-ondesk"
}

// process current person (runs when the decline or approve buttons are clicked)
function handleCurrentPerson(action) {
  // if the counter is busy with just terminate the function early with a if (condition) return
  if (!currentApplicant) return

  // add the applicant to the gameStats logs
  gameStats[action].push(currentApplicant) // same as gameStats.declined.push(currentApplicant) or gameStats.approved.push(currentApplicant)

  // did we do a mistake ? (if statement split on multiple lines for readability)
  if (
    action === "declined" && !currentApplicant.entryIssues.length || // if we declined, but there were no entryIssues, or...
    action === "approved" && currentApplicant.entryIssues.length // if we approved, but there were entryIssues
    ) gameStats.mistakes.push(currentApplicant) // add the current applicant to the mistakes array

  // display the person and their data on the gamelog:
  const gameLogElement = document.querySelector(".game-log")
  gameLogElement.innerHTML += `
    <div class=${action}>#${currentApplicant.id}. ${currentApplicant.passport.name}
      ${displayEntryStatus(currentApplicant.entryIssues)}
    </div>`
  
  // transition the person away from the counter
  applicantEl.className = action
  passportEl.className = "passport-inhand"
  applicationEl.className = "application-inhand"
  // reset currentApplicant to null
  currentApplicant = null
  // update stats on the page
  displayQueueAndStats()
  // check if there's more people in the queue, if not game is over
  if (!queue.length) gameOver()
}

// returns html elements with the applicants entry status
function displayEntryStatus(issues) {
  if (!issues.length) return `<span style="color: #4f4;"> - Status: OK!</span>` // if no issues, return a status ok text

  // store a span element in a variable, displaying the number of issue(s)
  let issuesElement = `<span style="color: yellow; "> - Status: ${issues.length} issue${issues.length > 1 ? "s" : ""}: </span>`
  // loop through each issue, and append it as a div to the issuesElement
  issues.forEach((issue, index) => {
    issuesElement += `<div style="color: orange; font-style: italic; padding-left: 2rem; ">${index+1}) ${issue}</div>`
  })
  
  return issuesElement
}


/*** utility functions: ***/
// returns url/path to the image, takes an image number as parameter
function photoUrl(photoId) {
  return `./img/avatars/avatar_${photoId}.svg`
}
// convert date to timestamp
function dateToTimestamp(date) {
  const [day, month, year] = date.split(".") // split date to array and destructure it
  return new Date(year, month-1, day).getTime() // month index is from 0-11 instead of 1-12, that's why: month-1
}
// calculate days between 2 dates
function daysBetweenDates(dateTo, dateFrom) {
  return (dateToTimestamp(dateTo) - dateToTimestamp(dateFrom)) / 1000 / 60 / 60 / 24 // ms, secs, mins, hours = days
}
// returns a random integer between a min value and a max value
function randomInt(max, min = 0) {
  return Math.floor(Math.random()*(max-min)+min)
}
// returns a random date (maxDate default param just means somewhere around 2008)
function randomDate(dateFrom = 1970, dateTo = 2030) {
  let newDate = new Date(randomInt(dateTo, dateFrom), 0, randomInt(365))
  return newDate.toLocaleDateString("NO-no")
}
// return a random country
function randomCountry(){
  return `${countries[randomInt(countries.length-1)]}`.toUpperCase()
}
// returns a random first and last name
function randomName() {
  return `${firstNames[randomInt(firstNames.length-1)]} ${lastNames[randomInt(lastNames.length-1)]}`.toUpperCase()
}

/****************************************************************************************************************************
*****************************************************************************************************************************/
function firstNameList() {
  return ["Jacob","Michael","Ethan","Joshua","Daniel","Alexander","Anthony","William","Christopher","Matthew","Jayden","Andrew","Joseph","David","Noah","Aiden","James","Ryan",
    "Logan","John","Nathan","Elijah","Christian","Gabriel","Benjamin","Jonathan","Tyler","Samuel","Nicholas","Gavin","Dylan","Jackson","Brandon","Caleb","Mason","Angel","Isaac","Evan","Jack",
    "Kevin","Jose","Isaiah","Luke","Landon","Justin","Lucas","Zachary","Jordan","Robert","Aaron","Brayden","Thomas","Cameron","Hunter","Austin","Adrian","Connor","Owen","Aidan","Jason","Julian",
    "Wyatt","Charles","Luis","Carter","Juan","Chase","Diego","Jeremiah","Brody","Xavier","Adam","Carlos","Sebastian","Liam","Hayden","Nathaniel","Henry","Jesus","Ian","Tristan","Bryan","Sean",
    "Cole","Alex","Eric","Brian","Jaden","Carson","Blake","Ayden","Cooper","Dominic","Brady","Caden","Josiah","Kyle","Colton","Kaden","Eli","Miguel","Antonio","Parker","Steven","Alejandro",
    "Riley","Richard","Timothy","Devin","Jesse","Victor","Jake","Joel","Colin","Kaleb","Bryce","Levi","Oliver","Oscar","Vincent","Ashton","Cody","Micah","Preston","Marcus","Max","Patrick",
    "Seth","Jeremy","Peyton","Nolan","Ivan","Damian","Maxwell","Alan","Kenneth","Jonah","Jorge","Mark","Giovanni","Eduardo","Grant","Collin","Gage","Omar","Emmanuel","Trevor","Edward","Ricardo",
    "Cristian","Nicolas","Kayden","George","Jaxon","Paul","Braden","Elias","Andres","Derek","Garrett","Tanner","Malachi","Conner","Fernando","Cesar","Javier","Miles","Jaiden","Alexis","Leonardo",
    "Santiago","Francisco","Cayden","Shane","Edwin","Hudson","Travis","Bryson","Erick","Jace","Hector","Josue","Peter","Jaylen","Mario","Manuel","Abraham","Grayson","Damien","Kaiden","Spencer",
    "Stephen","Edgar","Wesley","Shawn","Trenton","Jared","Jeffrey","Landen","Johnathan","Bradley","Braxton","Ryder","Camden","Roman","Asher","Brendan","Maddox","Sergio","Israel","Andy","Lincoln",
    "Erik","Donovan","Raymond","Avery","Rylan","Dalton","Harrison","Andre","Martin","Keegan","Marco","Jude","Sawyer","Dakota","Leo","Calvin","Kai","Drake","Troy","Zion","Clayton","Roberto",
    "Zane","Gregory","Tucker","Rafael","Kingston","Dominick","Ezekiel","Griffin","Devon","Drew","Lukas","Johnny","Ty","Pedro","Tyson","Caiden","Mateo","Braylon","Cash","Aden","Chance","Taylor",
    "Marcos","Maximus","Ruben","Emanuel","Simon","Corbin","Brennan","Dillon","Skyler","Myles","Xander","Jaxson","Dawson","Kameron","Kyler","Axel","Colby","Jonas","Joaquin","Payton","Brock",
    "Frank","Enrique","Quinn","Emilio","Malik","Grady","Angelo","Julio","Derrick","Raul","Fabian","Corey","Gerardo","Dante","Ezra","Armando","Allen","Theodore","Gael","Amir","Zander","Adan",
    "Maximilian","Randy","Easton","Dustin","Luca","Phillip","Julius","Charlie","Ronald","Jakob","Cade","Brett","Trent","Silas","Keith","Emiliano","Trey","Jalen","Darius","Lane","Jerry","Jaime",
    "Scott","Graham","Weston","Braydon","Anderson","Rodrigo","Pablo","Saul","Danny","Donald","Elliot","Brayan","Dallas","Lorenzo","Casey","Mitchell","Alberto","Tristen","Rowan","Jayson","Gustavo",
    "Aaden","Amari","Dean","Braeden","Declan","Chris","Ismael","Dane","Louis","Arturo","Brenden","Felix","Jimmy","Cohen","Tony","Holden","Reid","Abel","Bennett","Zackary","Arthur","Nehemiah",
    "Ricky","Esteban","Cruz","Finn","Mauricio","Dennis","Keaton","Albert","Marvin","Mathew","Larry","Moises","Issac","Philip","Quentin","Curtis","Greyson","Jameson","Everett","Jayce","Darren",
    "Elliott","Uriel","Alfredo","Hugo","Alec","Jamari","Marshall","Walter","Judah","Jay","Lance","Beau","Ali","Landyn","Yahir","Phoenix","Nickolas","Kobe","Bryant","Maurice","Russell","Leland",
    "Colten","Reed","Davis","Joe","Ernesto","Desmond","Kade","Reece","Morgan","Ramon","Rocco","Orlando","Ryker","Brodie","Paxton","Jacoby","Douglas","Kristopher","Gary","Lawrence","Izaiah",
    "Solomon","Nikolas","Mekhi","Justice","Tate","Jaydon","Salvador","Shaun","Alvin","Eddie","Kane","Davion","Zachariah","Dorian","Titus","Kellen","Camron","Isiah","Javon","Nasir","Milo","Johan",
    "Byron","Jasper","Jonathon","Chad","Marc","Kelvin","Chandler","Sam","Cory","Deandre","River","Reese","Roger","Quinton","Talon","Romeo","Franklin","Noel","Alijah","Guillermo","Gunner","Damon",
    "Jadon","Emerson","Micheal","Bruce","Terry","Kolton","Melvin","Beckett","Porter","August","Brycen","Dayton","Jamarion","Leonel","Karson","Zayden","Keagan","Carl","Khalil","Cristopher","Nelson",
    "Braiden","Moses","Isaias","Roy","Triston","Walker","Kale","Jermaine","Leon","Rodney","Kristian","Mohamed","Ronan","Pierce","Trace","Warren","Jeffery","Maverick","Cyrus","Quincy","Nathanael",
    "Skylar","Tommy","Conor","Noe","Ezequiel","Demetrius","Jaylin","Kendrick","Frederick","Terrance","Bobby","Jamison","Jon","Rohan","Jett","Kieran","Tobias","Ari","Colt","Gideon","Felipe","Kenny",
    "Wilson","Orion","Kamari","Gunnar","Jessie","Alonzo","Gianni","Omari","Waylon","Malcolm","Emmett","Abram","Julien","London","Tomas","Allan","Terrell","Matteo","Tristin","Jairo","Reginald","Brent",
    "Ahmad","Yandel","Rene","Willie","Boston","Billy","Marlon","Trevon","Aydan","Jamal","Aldo","Ariel","Cason","Braylen","Javion","Joey","Rogelio","Ahmed","Dominik","Brendon","Toby","Kody","Marquis",
    "Ulises","Armani","Adriel","Alfonso","Branden","Will","Craig","Ibrahim","Osvaldo","Wade","Harley","Steve","Davin","Deshawn","Kason","Damion","Jaylon","Jefferson","Aron","Brooks","Darian","Gerald",
    "Rolando","Terrence","Enzo","Kian","Ryland","Barrett","Jaeden","Ben","Bradyn","Giovani","Blaine","Madden","Jerome","Muhammad","Ronnie","Layne","Kolby","Leonard","Vicente","Cale","Alessandro",
    "Zachery","Gavyn","Aydin","Xzavier","Malakai","Raphael","Cannon","Rudy","Asa","Darrell","Giancarlo","Elisha","Junior","Zackery","Alvaro","Lewis","Valentin","Deacon","Jase","Harry","Kendall",
    "Rashad","Finnegan","Mohammed","Ramiro","Cedric","Brennen","Santino","Stanley","Tyrone","Chace","Francis","Johnathon","Teagan","Zechariah","Alonso","Kaeden","Kamden","Gilberto","Ray","Karter",
    "Luciano","Nico","Kole","Aryan","Draven","Jamie","Misael","Lee","Alexzander","Camren","Giovanny","Amare","Rhett","Rhys","Rodolfo","Nash","Markus","Deven","Mohammad","Moshe","Quintin","Dwayne",
    "Memphis","Atticus","Davian","Eugene","Jax","Antoine","Wayne","Randall","Semaj","Uriah","Clark","Aidyn","Jorden","Maxim","Aditya","Lawson","Messiah","Korbin","Sullivan","Freddy","Demarcus",
    "Neil","Brice","King","Davon","Elvis","Ace","Dexter","Heath","Duncan","Jamar","Sincere","Irvin","Remington","Kadin","Soren","Tyree","Damarion","Talan","Adrien","Gilbert","Keenan","Darnell",
    "Adolfo","Tristian","Derick","Isai","Rylee","Gauge","Harold","Kareem","Deangelo","Agustin","Coleman","Zavier","Lamar","Emery","Jaydin","Devan","Jordyn","Mathias","Prince","Sage","Seamus",
    "Jasiah","Efrain","Darryl","Arjun","Mike","Roland","Conrad","Kamron","Hamza","Santos","Frankie","Dominique","Marley","Vance","Dax","Jamir","Kylan","Todd","Maximo","Jabari","Matthias","Haiden",
    "Luka","Marcelo","Keon","Layton","Tyrell","Kash","Raiden","Cullen","Donte","Jovani","Cordell","Kasen","Rory","Alfred","Darwin","Ernest","Bailey","Gaige","Hassan","Jamarcus","Killian","Augustus",
    "Trevin","Zain","Ellis","Rex","Yusuf","Bruno","Jaidyn","Justus","Ronin","Humberto","Jaquan","Josh","Kasey","Winston","Dashawn","Lucian","Matias","Sidney","Ignacio","Nigel","Van","Elian",
    "Finley","Jaron","Addison","Aedan","Braedon","Jadyn","Konner","Zayne","Franco","Niko","Savion","Cristofer","Deon","Krish","Anton","Brogan","Cael","Coby","Kymani","Marcel","Yair","Dale",
    "Bo","Jordon","Samir","Darien","Zaire","Ross","Vaughn","Devyn","Kenyon","Clay","Dario","Ishaan","Jair","Kael","Adonis","Jovanny","Clinton","Rey","Chaim","German","Harper","Nathen","Rigoberto",
    "Sonny","Glenn","Octavio","Blaze","Keshawn","Ralph","Ean","Nikhil","Rayan","Sterling","Branson","Jadiel","Dillan","Jeramiah","Koen","Konnor","Antwan","Houston","Tyrese","Dereon","Leonidas",
    "Zack","Fisher","Jaydan","Quinten","Nick","Urijah","Darion","Jovan","Salvatore","Beckham","Jarrett","Antony","Eden","Makai","Zaiden","Broderick","Camryn","Malaki","Nikolai","Howard","Immanuel",
    "Demarion","Valentino","Jovanni","Ayaan","Ethen","Leandro","Royce","Yael","Yosef","Jean","Marquise","Alden","Leroy","Gaven","Jovany","Tyshawn","Aarav","Kadyn","Milton","Zaid","Kelton","Tripp",
    "Kamren","Slade","Hezekiah","Jakobe","Nathanial","Rishi","Shamar","Geovanni","Pranav","Roderick","Bentley","Clarence","Lyric","Bernard","Carmelo","Denzel","Maximillian","Reynaldo","Cassius",
    "Gordon","Reuben","Samson","Yadiel","Jayvon","Reilly","Sheldon","Abdullah","Jagger","Thaddeus","Case","Kyson","Lamont","Chaz","Makhi","Jan","Marques","Oswaldo","Donavan","Keyon","Kyan",
    "Simeon","Trystan","Andreas","Dangelo","Landin","Reagan","Turner","Arnav","Brenton","Callum","Jayvion","Bridger","Sammy","Deegan","Jaylan","Lennon","Odin","Abdiel","Jerimiah","Eliezer",
    "Bronson","Cornelius","Pierre","Cortez","Baron","Carlo","Carsen","Fletcher","Izayah","Kolten","Damari","Hugh","Jensen","Yurem","Emma","Isabella","Emily","Madison","Ava","Olivia","Sophia",
    "Abigail","Elizabeth","Chloe","Samantha","Addison","Natalie","Mia","Alexis","Alyssa","Hannah","Ashley","Ella","Sarah","Grace","Taylor","Brianna","Lily","Hailey","Anna","Victoria","Kayla",
    "Lillian","Lauren","Kaylee","Allison","Savannah","Nevaeh","Gabriella","Sofia","Makayla","Avery","Riley","Julia","Leah","Aubrey","Jasmine","Audrey","Katherine","Morgan","Brooklyn","Destiny",
    "Sydney","Alexa","Kylie","Brooke","Kaitlyn","Evelyn","Layla","Madeline","Kimberly","Zoe","Jessica","Peyton","Alexandra","Claire","Madelyn","Maria","Mackenzie","Arianna","Jocelyn","Amelia",
    "Angelina","Trinity","Andrea","Maya","Valeria","Sophie","Rachel","Vanessa","Aaliyah","Mariah","Gabrielle","Katelyn","Ariana","Bailey","Camila","Jennifer","Melanie","Gianna","Charlotte","Paige",
    "Autumn","Payton","Faith","Sara","Isabelle","Caroline","Genesis","Isabel","Mary","Zoey","Gracie","Megan","Haley","Mya","Michelle","Molly","Stephanie","Nicole","Jenna","Natalia","Sadie","Jada",
    "Serenity","Lucy","Ruby","Eva","Kennedy","Rylee","Jayla","Naomi","Rebecca","Lydia","Daniela","Bella","Keira","Adriana","Lilly","Hayden","Miley","Katie","Jade","Jordan","Gabriela","Amy","Angela",
    "Melissa","Valerie","Giselle","Diana","Amanda","Kate","Laila","Reagan","Jordyn","Kylee","Danielle","Briana","Marley","Leslie","Kendall","Catherine","Liliana","Mckenzie","Jacqueline","Ashlyn",
    "Reese","Marissa","London","Juliana","Shelby","Cheyenne","Angel","Daisy","Makenzie","Miranda","Erin","Amber","Alana","Ellie","Breanna","Ana","Mikayla","Summer","Piper","Adrianna","Jillian",
    "Sierra","Jayden","Sienna","Alicia","Lila","Margaret","Alivia","Brooklynn","Karen","Violet","Sabrina","Stella","Aniyah","Annabelle","Alexandria","Kathryn","Skylar","Aliyah","Delilah","Julianna",
    "Kelsey","Khloe","Carly","Amaya","Mariana","Christina","Alondra","Tessa","Eliana","Bianca","Jazmin","Clara","Vivian","Josephine","Delaney","Scarlett","Elena","Cadence","Alexia","Maggie","Laura",
    "Nora","Ariel","Elise","Nadia","Mckenna","Chelsea","Lyla","Alaina","Jasmin","Hope","Leila","Caitlyn","Cassidy","Makenna","Allie","Izabella","Eden","Callie","Haylee","Caitlin","Kendra","Karina",
    "Kyra","Kayleigh","Addyson","Kiara","Jazmine","Karla","Camryn","Alina","Lola","Kyla","Kelly","Fatima","Tiffany","Kira","Crystal","Mallory","Esmeralda","Alejandra","Eleanor","Angelica","Jayda",
    "Abby","Kara","Veronica","Carmen","Jamie","Ryleigh","Valentina","Allyson","Dakota","Kamryn","Courtney","Cecilia","Madeleine","Aniya","Alison","Esther","Heaven","Aubree","Lindsey","Leilani",
    "Nina","Melody","Macy","Ashlynn","Joanna","Cassandra","Alayna","Kaydence","Madilyn","Aurora","Heidi","Emerson","Kimora","Madalyn","Erica","Josie","Katelynn","Guadalupe","Harper","Ivy","Lexi",
    "Camille","Savanna","Dulce","Daniella","Lucia","Emely","Joselyn","Kiley","Kailey","Miriam","Cynthia","Rihanna","Georgia","Rylie","Harmony","Kiera","Kyleigh","Monica","Bethany","Kaylie","Cameron",
    "Teagan","Cora","Brynn","Ciara","Genevieve","Alice","Maddison","Eliza","Tatiana","Jaelyn","Erika","Ximena","April","Marely","Julie","Danica","Presley","Brielle","Julissa","Angie","Iris","Brenda",
    "Hazel","Rose","Malia","Shayla","Fiona","Phoebe","Nayeli","Paola","Kaelyn","Selena","Audrina","Rebekah","Carolina","Janiyah","Michaela","Penelope","Janiya","Anastasia","Adeline","Ruth","Sasha",
    "Denise","Holly","Madisyn","Hanna","Tatum","Marlee","Nataly","Helen","Janelle","Lizbeth","Serena","Anya","Jaslene","Kaylin","Jazlyn","Nancy","Lindsay","Desiree","Hayley","Itzel","Imani","Madelynn",
    "Asia","Kadence","Madyson","Talia","Jane","Kayden","Annie","Amari","Bridget","Raegan","Jadyn","Celeste","Jimena","Luna","Yasmin","Emilia","Annika","Estrella","Sarai","Lacey","Ayla","Alessandra",
    "Willow","Nyla","Dayana","Lilah","Lilliana","Natasha","Hadley","Harley","Priscilla","Claudia","Allisson","Baylee","Brenna","Brittany","Skyler","Fernanda","Danna","Melany","Cali","Lia","Macie",
    "Lyric","Logan","Gloria","Lana","Mylee","Cindy","Lilian","Amira","Anahi","Alissa","Anaya","Lena","Ainsley","Sandra","Noelle","Marisol","Meredith","Kailyn","Lesly","Johanna","Diamond","Evangeline",
    "Juliet","Kathleen","Meghan","Paisley","Athena","Hailee","Rosa","Wendy","Emilee","Sage","Alanna","Elaina","Cara","Nia","Paris","Casey","Dana","Emery","Rowan","Aubrie","Kaitlin","Jaden","Kenzie",
    "Kiana","Viviana","Norah","Lauryn","Perla","Amiyah","Alyson","Rachael","Shannon","Aileen","Miracle","Lillie","Danika","Heather","Kassidy","Taryn","Tori","Francesca","Kristen","Amya","Elle","Kristina",
    "Cheyanne","Haylie","Patricia","Anne","Samara","Skye","Kali","America","Lexie","Parker","Halle","Londyn","Abbigail","Linda","Hallie","Saniya","Bryanna","Bailee","Jaylynn","Mckayla","Quinn","Jaelynn",
    "Jaida","Caylee","Jaiden","Melina","Abril","Sidney","Kassandra","Elisabeth","Adalyn","Kaylynn","Mercedes","Yesenia","Elliana","Brylee","Dylan","Isabela","Ryan","Ashlee","Daphne","Kenya","Marina",
    "Christine","Mikaela","Kaitlynn","Justice","Saniyah","Jaliyah","Ingrid","Marie","Natalee","Joy","Juliette","Simone","Adelaide","Krystal","Kennedi","Mila","Tamia","Addisyn","Aylin","Dayanara",
    "Sylvia","Clarissa","Maritza","Virginia","Braelyn","Jolie","Jaidyn","Kinsley","Kirsten","Laney","Marilyn","Whitney","Janessa","Raquel","Anika","Kamila","Aria","Rubi","Adelyn","Amara","Ayanna",
    "Teresa","Zariah","Kaleigh","Amani","Carla","Yareli","Gwendolyn","Paulina","Nathalie","Annabella","Jaylin","Tabitha","Deanna","Madalynn","Journey","Aiyana","Skyla","Yaretzi","Ada","Liana","Karlee",
    "Jenny","Myla","Cristina","Myah","Lisa","Tania","Isis","Jayleen","Jordin","Arely","Azul","Helena","Aryanna","Jaqueline","Lucille","Destinee","Martha","Zoie","Arielle","Liberty","Marlene","Elisa",
    "Isla","Noemi","Raven","Jessie","Aleah","Kailee","Kaliyah","Lilyana","Haven","Tara","Giana","Camilla","Maliyah","Irene","Carley","Maeve","Lea","Macey","Sharon","Alisha","Marisa","Jaylene",
    "Kaya","Scarlet","Siena","Adyson","Maia","Shiloh","Tiana","Jaycee","Gisselle","Yazmin","Eve","Shyanne","Arabella","Sherlyn","Sariah","Amiya","Kiersten","Madilynn","Shania","Aleena","Finley",
    "Kinley","Kaia","Aliya","Taliyah","Pamela","Yoselin","Ellen","Carlie","Monserrat","Jakayla","Reyna","Yaritza","Carolyn","Clare","Lorelei","Paula","Zaria","Gracelyn","Kasey","Regan","Alena",
    "Angelique","Regina","Britney","Emilie","Mariam","Jaylee","Julianne","Greta","Elyse","Lainey","Kallie","Felicity","Zion","Aspen","Carlee","Annalise","Iliana","Larissa","Akira","Sonia","Catalina",
    "Phoenix","Joslyn","Anabelle","Mollie","Susan","Judith","Destiney","Hillary","Janet","Katrina","Mareli","Ansley","Kaylyn","Alexus","Gia","Maci","Elsa","Stacy","Kaylen","Carissa","Haleigh",
    "Lorena","Jazlynn","Milagros","Luz","Leanna","Renee","Shaniya","Charlie","Abbie","Cailyn","Cherish","Elsie","Jazmyn","Elaine","Emmalee","Luciana","Dahlia","Jamya","Belinda","Mariyah","Chaya",
    "Dayami","Rhianna","Yadira","Aryana","Rosemary","Armani","Cecelia","Celia","Barbara","Cristal","Eileen","Rayna","Campbell","Amina","Aisha","Amirah","Ally","Araceli","Averie","Mayra","Sanaa",
    "Patience","Leyla","Selah","Zara","Chanel","Kaiya","Keyla","Miah","Aimee","Giovanna","Amelie","Kelsie","Alisson","Angeline","Dominique","Adrienne","Brisa","Cierra","Paloma","Isabell","Precious",
    "Alma","Charity","Jacquelyn","Janae","Frances","Shyla","Janiah","Kierra","Karlie","Annabel","Jacey","Karissa","Jaylah","Xiomara","Edith","Marianna","Damaris","Deborah","Jaylyn","Evelin","Mara",
    "Olive","Ayana","India","Kendal","Kayley","Tamara","Briley","Charlee","Nylah","Abbey","Moriah","Saige","Savanah","Giada","Hana","Lizeth","Matilda","Ann","Jazlene","Gillian","Beatrice","Ireland",
    "Karly","Mylie","Yasmine","Ashly","Kenna","Maleah","Corinne","Keely","Tanya","Tianna","Adalynn","Ryann","Salma","Areli","Karma","Shyann","Kaley","Theresa","Evie","Gina","Roselyn","Kaila","Jaylen",
    "Natalya","Meadow","Rayne","Aliza","Yuliana","June","Lilianna","Nathaly","Ali","Alisa","Aracely","Belen","Tess","Jocelynn","Litzy","Makena","Abagail","Giuliana","Joyce","Libby","Lillianna",
    "Thalia","Tia","Sarahi","Zaniyah","Kristin","Lorelai","Mattie","Taniya","Jaslyn","Gemma","Valery","Lailah","Mckinley","Micah","Deja","Frida","Brynlee","Jewel","Krista","Mira","Yamilet",
    "Adison","Carina","Karli","Magdalena","Stephany","Charlize","Raelynn","Aliana","Cassie","Mina","Karley","Shirley","Marlie","Alani","Taniyah","Cloe","Sanai","Lina","Nola","Anabella","Dalia",
    "Raina","Mariela","Ariella","Bria","Kamari","Monique","Ashleigh","Reina","Alia","Ashanti","Lara","Lilia","Justine","Leia","Maribel","Abigayle","Tiara","Alannah","Princess","Sydnee","Kamora",
    "Paityn","Payten","Naima","Gretchen","Heidy","Nyasia","Livia","Marin","Shaylee","Maryjane","Laci","Nathalia","Azaria","Anabel","Chasity","Emmy","Izabelle","Denisse","Emelia","Mireya","Shea",
    "Amiah","Dixie","Maren","Averi","Esperanza","Micaela","Selina","Alyvia","Chana","Avah","Donna","Kaylah","Ashtyn","Karsyn","Makaila","Shayna","Essence","Leticia","Miya","Rory","Desirae","Kianna",
    "Laurel","Neveah","Amaris","Hadassah","Dania","Hailie","Jamiya","Kathy","Laylah","Riya","Diya","Carleigh","Iyana","Kenley","Sloane","Elianna"
  ];
}
function lastNameList() {
  return ["Smith","Johnson","Williams","Brown","Jones","Miller","Davis","Garcia","Rodriguez","Wilson","Martinez","Anderson","Taylor","Thomas","Hernandez","Moore","Martin","Jackson",
    "Thompson","White","Lopez","Lee","Gonzalez","Harris","Clark","Lewis","Robinson","Walker","Perez","Hall","Young","Allen","Sanchez","Wright","King","Scott","Green","Baker","Adams","Nelson","Hill",
    "Ramirez","Campbell","Mitchell","Roberts","Carter","Phillips","Evans","Turner","Torres","Parker","Collins","Edwards","Stewart","Flores","Morris","Nguyen","Murphy","Rivera","Cook","Rogers","Morgan",
    "Peterson","Cooper","Reed","Bailey","Bell","Gomez","Kelly","Howard","Ward","Cox","Diaz","Richardson","Wood","Watson","Brooks","Bennett","Gray","James","Reyes","Cruz","Hughes","Price","Myers",
    "Long","Foster","Sanders","Ross","Morales","Powell","Sullivan","Russell","Ortiz","Jenkins","Gutierrez","Perry","Butler","Barnes","Fisher","Henderson","Coleman","Simmons","Patterson","Jordan",
    "Reynolds","Hamilton","Graham","Kim","Gonzales","Alexander","Ramos","Wallace","Griffin","West","Cole","Hayes","Chavez","Gibson","Bryant","Ellis","Stevens","Murray","Ford","Marshall","Owens",
    "Mcdonald","Harrison","Ruiz","Kennedy","Wells","Alvarez","Woods","Mendoza","Castillo","Olson","Webb","Washington","Tucker","Freeman","Burns","Henry","Vasquez","Snyder","Simpson","Crawford",
    "Jimenez","Porter","Mason","Shaw","Gordon","Wagner","Hunter","Romero","Hicks","Dixon","Hunt","Palmer","Robertson","Black","Holmes","Stone","Meyer","Boyd","Mills","Warren","Fox","Rose","Rice",
    "Moreno","Schmidt","Patel","Ferguson","Nichols","Herrera","Medina","Ryan","Fernandez","Weaver","Daniels","Stephens","Gardner","Payne","Kelley","Dunn","Pierce","Arnold","Tran","Spencer","Peters",
    "Hawkins","Grant","Hansen","Castro","Hoffman","Hart","Elliott","Cunningham","Knight","Bradley","Carroll","Hudson","Duncan","Armstrong","Berry","Andrews","Johnston","Ray","Lane","Riley","Carpenter",
    "Perkins","Aguilar","Silva","Richards","Willis","Matthews","Chapman","Lawrence","Garza","Vargas","Watkins","Wheeler","Larson","Carlson","Harper","George","Greene","Burke","Guzman","Morrison",
    "Munoz","Jacobs","Obrien","Lawson","Franklin","Lynch","Bishop","Carr","Salazar","Austin","Mendez","Gilbert","Jensen","Williamson","Montgomery","Harvey","Oliver","Howell","Dean","Hanson","Weber",
    "Garrett","Sims","Burton","Fuller","Soto","Mccoy","Welch","Chen","Schultz","Walters","Reid","Fields","Walsh","Little","Fowler","Bowman","Davidson","May","Day","Schneider","Newman","Brewer",
    "Lucas","Holland","Wong","Banks","Santos","Curtis","Pearson","Delgado","Valdez","Pena","Rios","Douglas","Sandoval","Barrett","Hopkins","Keller","Guerrero","Stanley","Bates","Alvarado","Beck",
    "Ortega","Wade","Estrada","Contreras","Barnett","Caldwell","Santiago","Lambert","Powers","Chambers","Nunez","Craig","Leonard","Lowe","Rhodes","Byrd","Gregory","Shelton","Frazier","Becker",
    "Maldonado","Fleming","Vega","Sutton","Cohen","Jennings","Parks","Mcdaniel","Watts","Barker","Norris","Vaughn","Vazquez","Holt","Schwartz","Steele","Benson","Neal","Dominguez","Horton",
    "Terry","Wolfe","Hale","Lyons","Graves","Haynes","Miles","Park","Warner","Padilla","Bush","Thornton","Mccarthy","Mann","Zimmerman","Erickson","Fletcher","Mckinney","Page","Dawson","Joseph",
    "Marquez","Reeves","Klein","Espinoza","Baldwin","Moran","Love","Robbins","Higgins","Ball","Cortez","Le","Griffith","Bowen","Sharp","Cummings","Ramsey","Hardy","Swanson","Barber","Acosta",
    "Luna","Chandler","Blair","Daniel","Cross","Simon","Dennis","Oconnor","Quinn","Gross","Navarro","Moss","Fitzgerald","Doyle","Mclaughlin","Rojas","Rodgers","Stevenson","Singh","Yang","Figueroa",
    "Harmon","Newton","Paul","Manning","Garner","Mcgee","Reese","Francis","Burgess","Adkins","Goodman","Curry","Brady","Christensen","Potter","Walton","Goodwin","Mullins","Molina","Webster",
    "Fischer","Campos","Avila","Sherman","Todd","Chang","Blake","Malone","Wolf","Hodges","Juarez","Gill","Farmer","Hines","Gallagher","Duran","Hubbard","Cannon","Miranda","Wang","Saunders","Tate",
    "Mack","Hammond","Carrillo","Townsend","Wise","Ingram","Barton","Mejia","Ayala","Schroeder","Hampton","Rowe","Parsons","Frank","Waters","Strickland","Osborne","Maxwell","Chan","Deleon",
    "Norman","Harrington","Casey","Patton","Logan","Bowers","Mueller","Glover","Floyd","Hartman","Buchanan","Cobb","French","Kramer","Mccormick","Clarke","Tyler","Gibbs","Moody","Conner","Sparks",
    "Mcguire","Leon","Bauer","Norton","Pope","Flynn","Hogan","Robles","Salinas","Yates","Lindsey","Lloyd","Marsh","Mcbride","Owen","Solis","Pham","Lang","Pratt","Lara","Brock","Ballard","Trujillo",
    "Shaffer","Drake","Roman","Aguirre","Morton","Stokes","Lamb","Pacheco","Patrick","Cochran","Shepherd","Cain","Burnett","Hess","Li","Cervantes","Olsen","Briggs","Ochoa","Cabrera","Velasquez",
    "Montoya","Roth","Meyers","Cardenas","Fuentes","Weiss","Hoover","Wilkins","Nicholson","Underwood","Short","Carson","Morrow","Colon","Holloway","Summers","Bryan","Petersen","Mckenzie","Serrano",
    "Wilcox","Carey","Clayton","Poole","Calderon","Gallegos","Greer","Rivas","Guerra","Decker","Collier","Wall","Whitaker","Bass","Flowers","Davenport","Conley","Houston","Huff","Copeland","Hood",
    "Monroe","Massey","Roberson","Combs","Franco","Larsen","Pittman","Randall","Skinner","Wilkinson","Kirby","Cameron","Bridges","Anthony","Richard","Kirk","Bruce","Singleton","Mathis","Bradford",
    "Boone","Abbott","Charles","Allison","Sweeney","Atkinson","Horn","Jefferson","Rosales","York","Christian","Phelps","Farrell","Castaneda","Nash","Dickerson","Bond","Wyatt","Foley","Chase","Gates",
    "Vincent","Mathews","Hodge","Garrison","Trevino","Villarreal","Heath","Dalton","Valencia","Callahan","Hensley","Atkins","Huffman","Roy","Boyer","Shields","Lin","Hancock","Grimes","Glenn",
    "Cline","Delacruz","Camacho","Dillon","Parrish","Oneill","Melton","Booth","Kane","Berg","Harrell","Pitts","Savage","Wiggins","Brennan","Salas","Marks","Russo","Sawyer","Baxter","Golden",
    "Hutchinson","Liu","Walter","Mcdowell","Wiley","Rich","Humphrey","Johns","Koch","Suarez","Hobbs","Beard","Gilmore","Ibarra","Keith","Macias","Khan","Andrade","Ware","Stephenson","Henson",
    "Wilkerson","Dyer","Mcclure","Blackwell","Mercado","Tanner","Eaton","Clay","Barron","Beasley","Oneal","Preston","Small","Wu","Zamora","Macdonald","Vance","Snow","Mcclain","Stafford","Orozco",
    "Barry","English","Shannon","Kline","Jacobson","Woodard","Huang","Kemp","Mosley","Prince","Merritt","Hurst","Villanueva","Roach","Nolan","Lam","Yoder","Mccullough","Lester","Santana",
    "Valenzuela","Winters","Barrera","Leach","Orr","Berger","Mckee","Strong","Conway","Stein","Whitehead","Bullock","Escobar","Knox","Meadows","Solomon","Velez","Odonnell","Kerr","Stout",
    "Blankenship","Browning","Kent","Lozano","Bartlett","Pruitt","Buck","Barr","Gaines","Durham","Gentry","Mcintyre","Sloan","Melendez","Rocha","Herman","Sexton","Moon","Hendricks","Rangel",
    "Stark","Lowery","Hardin","Hull","Sellers","Ellison","Calhoun","Gillespie","Mora","Knapp","Mccall","Morse","Dorsey","Weeks","Nielsen","Livingston","Leblanc","Mclean","Bradshaw","Glass",
    "Middleton","Buckley","Schaefer","Frost","Howe","House","Mcintosh","Ho","Pennington","Reilly","Hebert","Mcfarland","Hickman","Noble","Spears","Conrad","Arias","Galvan","Velazquez","Huynh",
    "Frederick","Randolph","Cantu","Fitzpatrick","Mahoney","Peck","Villa","Michael","Donovan","Mcconnell","Walls","Boyle","Mayer","Zuniga","Giles","Pineda","Pace","Hurley","Mays","Mcmillan",
    "Crosby","Ayers","Case","Bentley","Shepard","Everett","Pugh","David","Mcmahon","Dunlap","Bender","Hahn","Harding","Acevedo","Raymond","Blackburn","Duffy","Landry","Dougherty","Bautista",
    "Shah","Potts","Arroyo","Valentine","Meza","Gould","Vaughan","Fry","Rush","Avery","Herring","Dodson","Clements","Sampson","Tapia","Bean","Lynn","Crane","Farley","Cisneros","Benton","Ashley",
    "Mckay","Finley","Best","Blevins","Friedman","Moses","Sosa","Blanchard","Huber","Frye","Krueger","Bernard","Rosario","Rubio","Mullen","Benjamin","Haley","Chung","Moyer","Choi","Horne","Yu",
    "Woodward","Ali","Nixon","Hayden","Rivers","Estes","Mccarty","Richmond","Stuart","Maynard","Brandt","Oconnell","Hanna","Sanford","Sheppard","Church","Burch","Levy","Rasmussen","Coffey",
    "Ponce","Faulkner","Donaldson","Schmitt","Novak","Costa","Montes","Booker","Cordova","Waller","Arellano","Maddox","Mata","Bonilla","Stanton","Compton","Kaufman","Dudley","Mcpherson","Beltran",
    "Dickson","Mccann","Villegas","Proctor","Hester","Cantrell","Daugherty","Cherry","Bray","Davila","Rowland","Levine","Madden","Spence","Good","Irwin","Werner","Krause","Petty","Whitney","Baird",
    "Hooper","Pollard","Zavala","Jarvis","Holden","Haas","Hendrix","Mcgrath","Bird","Lucero","Terrell","Riggs","Joyce","Mercer","Rollins","Galloway","Duke","Odom","Andersen","Downs","Hatfield",
    "Benitez","Archer","Huerta","Travis","Mcneil","Hinton","Zhang","Hays","Mayo","Fritz","Branch","Mooney","Ewing","Ritter","Esparza","Frey","Braun","Gay","Riddle","Haney","Kaiser","Holder",
    "Chaney","Mcknight","Gamble","Vang","Cooley","Carney","Cowan","Forbes","Ferrell","Davies","Barajas","Shea","Osborn","Bright","Cuevas","Bolton","Murillo","Lutz","Duarte","Kidd","Key","Cooke"
  ];
}
function countryList() {
  return [
      "Afghanistan",
      "Albania",
      "Algeria",
      "American Samoa",
      "Andorra",
      "Angola",
      "Anguilla",
      "Antarctica",
      "Antigua and Barbuda",
      "Argentina",
      "Armenia",
      "Aruba",
      "Australia",
      "Austria",
      "Azerbaijan",
      "Bahamas (the)",
      "Bahrain",
      "Bangladesh",
      "Barbados",
      "Belarus",
      "Belgium",
      "Belize",
      "Benin",
      "Bermuda",
      "Bhutan",
      "Bolivia (Plurinational State of)",
      "Bonaire, Sint Eustatius and Saba",
      "Bosnia and Herzegovina",
      "Botswana",
      "Bouvet Island",
      "Brazil",
      "British Indian Ocean Territory (the)",
      "Brunei Darussalam",
      "Bulgaria",
      "Burkina Faso",
      "Burundi",
      "Cabo Verde",
      "Cambodia",
      "Cameroon",
      "Canada",
      "Cayman Islands (the)",
      "Central African Republic (the)",
      "Chad",
      "Chile",
      "China",
      "Christmas Island",
      "Cocos (Keeling) Islands (the)",
      "Colombia",
      "Comoros (the)",
      "Congo (the Democratic Republic of the)",
      "Congo (the)",
      "Cook Islands (the)",
      "Costa Rica",
      "Croatia",
      "Cuba",
      "Curaçao",
      "Cyprus",
      "Czechia",
      "Côte d'Ivoire",
      "Denmark",
      "Djibouti",
      "Dominica",
      "Dominican Republic (the)",
      "Ecuador",
      "Egypt",
      "El Salvador",
      "Equatorial Guinea",
      "Eritrea",
      "Estonia",
      "Eswatini",
      "Ethiopia",
      "Falkland Islands (the) [Malvinas]",
      "Faroe Islands (the)",
      "Fiji",
      "Finland",
      "France",
      "French Guiana",
      "French Polynesia",
      "French Southern Territories (the)",
      "Gabon",
      "Gambia (the)",
      "Georgia",
      "Germany",
      "Ghana",
      "Gibraltar",
      "Greece",
      "Greenland",
      "Grenada",
      "Guadeloupe",
      "Guam",
      "Guatemala",
      "Guernsey",
      "Guinea",
      "Guinea-Bissau",
      "Guyana",
      "Haiti",
      "Heard Island and McDonald Islands",
      "Holy See (the)",
      "Honduras",
      "Hong Kong",
      "Hungary",
      "Iceland",
      "India",
      "Indonesia",
      "Iran (Islamic Republic of)",
      "Iraq",
      "Ireland",
      "Isle of Man",
      "Israel",
      "Italy",
      "Jamaica",
      "Japan",
      "Jersey",
      "Jordan",
      "Kazakhstan",
      "Kenya",
      "Kiribati",
      "Korea (the Democratic People's Republic of)",
      "Korea (the Republic of)",
      "Kuwait",
      "Kyrgyzstan",
      "Lao People's Democratic Republic (the)",
      "Latvia",
      "Lebanon",
      "Lesotho",
      "Liberia",
      "Libya",
      "Liechtenstein",
      "Lithuania",
      "Luxembourg",
      "Macao",
      "Madagascar",
      "Malawi",
      "Malaysia",
      "Maldives",
      "Mali",
      "Malta",
      "Marshall Islands (the)",
      "Martinique",
      "Mauritania",
      "Mauritius",
      "Mayotte",
      "Mexico",
      "Micronesia (Federated States of)",
      "Moldova (the Republic of)",
      "Monaco",
      "Mongolia",
      "Montenegro",
      "Montserrat",
      "Morocco",
      "Mozambique",
      "Myanmar",
      "Namibia",
      "Nauru",
      "Nepal",
      "Netherlands (the)",
      "New Caledonia",
      "New Zealand",
      "Nicaragua",
      "Niger (the)",
      "Nigeria",
      "Niue",
      "Norfolk Island",
      "Northern Mariana Islands (the)",
      "Norway",
      "Oman",
      "Pakistan",
      "Palau",
      "Palestine, State of",
      "Panama",
      "Papua New Guinea",
      "Paraguay",
      "Peru",
      "Philippines (the)",
      "Pitcairn",
      "Poland",
      "Portugal",
      "Puerto Rico",
      "Qatar",
      "Republic of North Macedonia",
      "Romania",
      "Russian Federation (the)",
      "Rwanda",
      "Réunion",
      "Saint Barthélemy",
      "Saint Helena, Ascension and Tristan da Cunha",
      "Saint Kitts and Nevis",
      "Saint Lucia",
      "Saint Martin (French part)",
      "Saint Pierre and Miquelon",
      "Saint Vincent and the Grenadines",
      "Samoa",
      "San Marino",
      "Sao Tome and Principe",
      "Saudi Arabia",
      "Senegal",
      "Serbia",
      "Seychelles",
      "Sierra Leone",
      "Singapore",
      "Sint Maarten (Dutch part)",
      "Slovakia",
      "Slovenia",
      "Solomon Islands",
      "Somalia",
      "South Africa",
      "South Georgia and the South Sandwich Islands",
      "South Sudan",
      "Spain",
      "Sri Lanka",
      "Sudan (the)",
      "Suriname",
      "Svalbard and Jan Mayen",
      "Sweden",
      "Switzerland",
      "Syrian Arab Republic",
      "Taiwan",
      "Tajikistan",
      "Tanzania, United Republic of",
      "Thailand",
      "Timor-Leste",
      "Togo",
      "Tokelau",
      "Tonga",
      "Trinidad and Tobago",
      "Tunisia",
      "Turkey",
      "Turkmenistan",
      "Turks and Caicos Islands (the)",
      "Tuvalu",
      "Uganda",
      "Ukraine",
      "United Arab Emirates (the)",
      "United Kingdom of Great Britain and Northern Ireland (the)",
      "United States Minor Outlying Islands (the)",
      "United States of America (the)",
      "Uruguay",
      "Uzbekistan",
      "Vanuatu",
      "Venezuela (Bolivarian Republic of)",
      "Viet Nam",
      "Virgin Islands (British)",
      "Virgin Islands (U.S.)",
      "Wallis and Futuna",
      "Western Sahara",
      "Yemen",
      "Zambia",
      "Zimbabwe",
      "Åland Islands"
  ];
}