const express = require('express');
const UserRouter = require('./routers/userRouter');
const cors = require('cors');

const app = express();

const port = 5000;

// middleware
app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(express.json());
app.use('/user', UserRouter);

// route or endpoint
app.get('/', (req, res) => {
    res.send('response from express');
});

app.get('/add', (req, res) => {
    res.send('response from add');
});

// getall
// getbyid

app.listen(port, () => {
    console.log('server started');
});