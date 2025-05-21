const express = require('express');
const path = require('path'); 
const fs = require('fs');
const session = require('express-session');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));


app.use(session({
  secret: 'secret-key',  
  resave: false,
  saveUninitialized: false
}));


const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');

function renderPage(title, content) {
  return template
    .replace('{{title}}', title)
    .replace('{{content}}', content);
}

function createRoute(routePath, pageName) {
  app.get(routePath, (req, res) => {
    const filePath = path.join(__dirname, `${pageName}.html`);
    fs.readFile(filePath, 'utf8', (err, contentData) => {
      const page = renderPage(pageName, contentData);
      res.send(page);
    });
  });
}

createRoute('/', 'home');
createRoute('/signup', 'signup');
createRoute('/find', 'find');
createRoute('/dog', 'dog');
createRoute('/cat', 'cat');
createRoute('/contact', 'contact');
createRoute('/privacy', 'privacy');


app.post('/signup', (req, res) => {
  const username = req.body.username1;
  const password = req.body.password1;
  const loginFile = path.join(__dirname, 'login.txt');

  fs.readFile(loginFile, 'utf8', (err, data) => {
    const lines = data.split('\n');
    let usernameExists = false;
    for (let line of lines) {
      if (line.trim() === '') continue;
      const [existingUsername] = line.split(':');
      if (existingUsername === username) {
        usernameExists = true;
        break;
      }
    }

    if (usernameExists) {
      const content = '<p>Username is already taken. Please choose another one.</p>';
      const page = renderPage('Signup Error', content);
      res.send(page);
    } else {
      fs.appendFile(loginFile, `${username}:${password}\n`, (err) => {
        const content = '<p>Account created successfully. You can now log in.</p>';
        const page = renderPage('Signup Success', content);
        res.send(page);
      });
    }
  });
});


app.get('/give_away', (req, res) => {
  if (!req.session.user) {
    
    const filePath = path.join(__dirname, 'giveaway_login.html');
    fs.readFile(filePath, 'utf8', (err, contentData) => {
      const page = renderPage('Pet Giveaway - Login', contentData);
      res.send(page);
    });
  } else {
  
    const filePath = path.join(__dirname, 'give_away.html');
    fs.readFile(filePath, 'utf8', (err, contentData) => {
      const page = renderPage('Have a Pet to Give Away', contentData);
      res.send(page);
    });
  }
});


app.post('/give_away/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const loginFile = path.join(__dirname, 'login.txt');
  
  fs.readFile(loginFile, 'utf8', (err, data) => {
   
    let authenticated = false;
    const lines = data.split('\n');
    for (let line of lines) {
      if (line.trim() === '') continue;
      const [existingUser, existingPass] = line.split(':');
      if (existingUser === username && existingPass === password) {
        authenticated = true;
        break;
      }
    }
    
    if (authenticated) {
      req.session.user = username;   
      res.redirect('/give_away');      
    } else {
      res.send(
        renderPage('Login Failed', `<script>
          alert('Login failed. Please try again.');
          window.history.back();
        </script>`)
      );
    }
  });
});


app.post('/give_away', (req, res) => {

    const petType      = req.body.petType;       
    const breed        = req.body.breed;
    const age          = req.body.age;
    const gender       = req.body.gender;
    let comp           = req.body.comp;          
    const comments     = req.body.comments;
    const ownerFirst   = req.body.ownerFirstName;
    const ownerLast    = req.body.ownerLastName;
    const ownerEmail   = req.body.ownerEmail;
  
   
    if (Array.isArray(comp)) { //check boxes being put together (to remember for future).
      comp = comp.join(",");
    } else if (!comp) {
      comp = "none";
    }
    
   
    const petsFile = path.join(__dirname, 'pets.txt');
    fs.readFile(petsFile, 'utf8', (err, data) => {
      let id = 1;
      if (!err && data.trim() !== '') {
        const lines = data.trim().split('\n');
        id = lines.length + 1;
      }

      const record = `${id}:${req.session.user}:${petType}:${breed}:${age}:${gender}:${comments}:${ownerFirst}:${ownerLast}:${ownerEmail}:${comp}\n`;
  
      fs.appendFile(petsFile, record, () => {
    
        res.send(renderPage('Submission Success', `<script>
          alert('Pet information submitted successfully.');
          window.location.href = '/';
        </script>`));
      });
    });
  });

  app.get('/logout', (req, res) => {
    if (!req.session.user) {
        return res.send(renderPage('Not Logged In', `<script>
          alert('You are not currently logged in.');
          window.location.href = '/';
        </script>`));
      }

    req.session.destroy(() => {
     
      res.send(renderPage('Logged Out', `<script>
        alert('You have been successfully logged out.');
        window.location.href = '/';
      </script>`));
    });
  });

  app.get('/search', (req, res) => {
    const { petType, breed, age, gender, compatibility } = req.query;
    let searchCompat;
    if (compatibility) {
      if (Array.isArray(compatibility)) {
        searchCompat = compatibility.map(val => val.toLowerCase().trim());
      } else {
        searchCompat = [compatibility.toLowerCase().trim()];
      }
    } else {
      searchCompat = [];
    }
    
    const petsFile = path.join(__dirname, 'pets.txt');
    
    fs.readFile(petsFile, 'utf8', (err, data) => {
      const lines = data.split('\n').filter(line => line.trim() !== '');
      let petCardsHtml = '';
      
      lines.forEach(line => {
        const fields = line.split(':');

        const [
          id,
          recordUsername,
          recordPetType,
          recordBreed,
          recordAge,
          recordGender,
          recordDescription,
          ownerFirst,
          ownerLast,
          ownerEmail,
          recordCompat
        ] = fields;
        
        if (recordPetType.toLowerCase() !== petType.toLowerCase()) return;
        
        if (breed && breed !== "Doesn't matter" && recordBreed !== breed) return;
        
        if (age && age !== "Doesn't matter" && recordAge !== age) return;
        
        if (gender && gender.toLowerCase() !== "any" && gender.toLowerCase() !== "doesn't matter" && recordGender.toLowerCase() !== gender.toLowerCase()) return;
        
        if (searchCompat.length > 0) {
          const recordCompatArray = recordCompat.split(',').map(val => val.toLowerCase().trim());
          const hasCompat = searchCompat.some(val => recordCompatArray.includes(val));
          if (!hasCompat) return;
        }
        
        petCardsHtml += `
          <div class="petCard">
            <div class="petImage">
              <!-- Optionally, insert an image here -->
            </div>
            <div class="petInfo">
              <h3>${recordBreed}</h3>
              <p><span class="petLabel">Type:</span> ${recordPetType}</p>
              <p><span class="petLabel">Breed:</span> ${recordBreed}</p>
              <p><span class="petLabel">Age:</span> ${recordAge}</p>
              <p><span class="petLabel">Gender:</span> ${recordGender}</p>
              <p><span class="petLabel">Compatibility:</span> ${recordCompat}</p>
              <p><span class="petLabel">Description:</span> ${recordDescription}</p>
              <p><span class="petLabel">Owner Name:</span> ${ownerFirst} ${ownerLast}</p>
              <p><span class="petLabel">Owner Email:</span> ${ownerEmail}</p>
              <button class="submit">Interested</button>
            </div>
          </div>
        `;
      });
      
      if (!petCardsHtml) {
        petCardsHtml = '<p>No pets match your search criteria.</p>';
      }
      
      const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="stylesheet" href="styles2.css" />
            <title>Browse Available Pets</title>
            <script src="myScript.js" defer></script>
          </head>
          <body>
            <div id="header-container">
              <header>
                <a href="/"><img src="logo.jpeg" alt="logo" /></a>
                <h1>Adopt Me</h1>
                <div id="date"></div>
              </header>
            </div>
            <div class="container">
              <div id="nav-container">
                <nav>
                  <ul>
                    <li><a href="/">Home Page</a></li>
                    <li><a href="/signup">Create an account</a></li>
                    <li><a href="/find">Find a dog/cat</a></li>
                    <li><a href="/dog">Dog Care</a></li>
                    <li><a href="/cat">Cat Care</a></li>
                    <li><a href="/give_away">Have a pet to give away</a></li>
                    <li><a href="/contact">Contact us</a></li>
                    <li><a href="/logout">LogOut</a></li>
                  </ul>
                </nav>
              </div>
              <div class="content">
                <main>
                  <div class="petList">
                    ${petCardsHtml}
                  </div>
                </main>
                <div id="foot-container">
                  <footer>
                    <p>&copy; 2025 Adopt Me. All Rights Reserved.</p>
                    <p class="privacyUrl">
                      <a href="/privacy">Privacy / Disclaimer Statement</a>
                    </p>
                  </footer>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;
      
      res.send(html);
    });
  });
  
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
