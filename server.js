import express from 'express';
import cors from 'cors';
const app = express();

const pageSize = 15;

app.use(cors());



app.get('/top', async (req, res) => {
    const idResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');

    const page = parseInt(req.query.page, 10) || 0;
    const offset = page * pageSize;
    const ids = await idResponse.json().then(ids => ids.slice(offset, offset + pageSize));

    const items = await Promise.all(ids.map(id =>fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(async response => {

        const data = await response.json();
        const item = {
            ...data,
        }

        delete item.kids;

        return item;
    })));

    res.json(items);
});

app.get('/details', async (req, res) => {
    const id = req.query.id;

    if(!id) {
        return res.status(400).send('Missing id');
    }

    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);

    const details = await response.json();

    details.comments = await Promise.all((details.kids ?? [])
            .map(id => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
            .then(response => response.json()))
    );

    delete details.kids;

    res.json(details);
});

app.listen(3000, '0.0.0.0', () => {
    console.log('Example app listening on port 3000!');
});
