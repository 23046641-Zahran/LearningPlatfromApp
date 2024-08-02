const express = require('express');
const mysql = require('mysql2');
const app = express();
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mylearningplatforms'
});
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({
    extended: false
}));

app.get('/purchase', (req, res) => res.render('purchase')); 

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        if (results.length > 0) {
            res.render('dashboard', { user: results[0] });
        } else {
            res.redirect('/');
        }
    });
});


app.get('/signup', (req, res) => {
    res.render('signup');
});

// Handle the sign-up form submission
app.post('/signup', (req, res) => {
    res.redirect('/');
});

app.get('/', (req, res) => {
    res.render('index'); // Render HTML page with data
});

app.get('/course', (req, res) => {
    connection.query('SELECT * FROM courses', (error, results) => {
        if (error) throw error;
        res.render('displayCourse', { courses : results }); // Render HTML page with data
    });
});

app.get('/instructor', (req, res) => {
    connection.query('SELECT * FROM instructors', (error, results) => {
        if (error) throw error;
        res.render('displayInstructor', { instructors: results }); // Render HTML page with data
    });
});

app.get('/instructor/:id', (req, res) => {
    const instructorId = req.params.id;
    const sql = 'SELECT * FROM instructors WHERE instructorId = ?';
    connection.query(sql, [instructorId], (error, results) => {
        if (error) {
            z
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retriving instructor by ID')
        }
        if (results.length > 0) {
            res.render('instructor', { instructor: results[0] });
        } else {
            res.status(404).send('Instructor not found');
        }
    })
})


app.get('/bookings', (req, res) => {
    // Query to get all bookings from the database
    const sql = 'SELECT * FROM instructors';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error("Error fetching bookings:", error);
            res.status(500).send('Error fetching bookings');
        } else {
            // Pass the bookings data to the EJS template
            res.render('addBooking', { bookings: results });
        }
    });
});

app.post('/bookings', (req, res) => {
    // Extract product data from the request body 
    const { bookingDate, time ,instructorId} = req.body;
    const sql = 'INSERT INTO bookings (bookingDate, time, instructorId) VALUES (?, ?, ?)';
    connection.query(sql, [bookingDate, time, instructorId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error adding booking:", error);
            res.status(500).send('Error adding booking');
        } else {
            // Send a success response
            res.redirect('/displayBooking');
        }
    })
})

app.get('/displayBooking', (req, res) => {
    connection.query('SELECT bookings.bookingId, bookings.bookingDate, bookings.time, instructors.instructorName FROM bookings JOIN instructors ON instructors.instructorId = bookings.instructorId', (error, results) => {
        if (error) throw error;
        res.render('displayBooking', { bookings: results }); // Render HTML page with data
    });
});

app.get('/editBooking/:id', (req, res) => {
    const bookingId = req.params.id;
    const sql = 'SELECT * FROM bookings WHERE bookingId = ?';
    connection.query(sql, [bookingId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retriving booking by ID')
        }
        if (results.length > 0) {
            res.render('editBooking', { bookings : results[0] });
        } else {
            res.status(404).send('Booking not found');
        }
    })
})

app.post('/editBooking/:id', (req, res) => {
    const bookingId = req.params.id;
    const { bookingDate, time } = req.body;
    const sql = 'UPDATE bookings SET bookingDate = ?, time = ? WHERE bookingId = ?';
    connection.query(sql, [bookingDate, time, bookingId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error updating booking:", error);
            res.status(500).send('Error updating booking');
        } else {
            // Send a success response
            res.redirect('/displayBooking');
        }
    })
})

app.get('/deleteBooking/:id', (req, res) => {
    const bookingId = req.params.id;
    const sql = 'DELETE FROM bookings WHERE bookingId = ?';
    connection.query(sql, [bookingId], (error, results) => {
        if (error) {
            console.error("Error deleting booking:", error);
            res.status(500).send('Error deleting booking');
        } else {
            res.redirect('/displayBooking');
        }
    })
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));