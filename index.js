const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')
const app = express()

// const requestLogger = (request, response, next) => {
//     console.log('Method:', request.method)
//     console.log('Path:  ', request.path)
//     console.log('Body:  ', request.body)
//     console.log('---')
//     next()
// }
app.use(express.static('dist'))
app.use(express.json())
//app.use(requestLogger)
morgan.token('body', (req, res) => {return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/info', (req, res) => {
    Person.countDocuments({}).then(count => {
        res.send(`
            <p>Phonebook has info for ${count} people</p>
            <p>${new Date()}</p>
        `)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
    .then(person => {
        if(person) {
            res.json(person)
        }
        else {
            res.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
    const { name, number } = req.body
    if(!name || !number){
        return res.status(400).json({
            error: "name or number missing"
        })
    }
    const person = new Person({
        name: name,
        number: number
    })
    person.save()
    .then(savedPerson => {
        res.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const { name, number } = req.body
    Person.findById(req.params.id)
    .then(person => {
        if(!person) {
            return res.status(404).end()
        }
        person.name = name
        person.number = number
        return person.save().then(updatedPerson => {
            res.json(updatedPerson)
        })
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
    .then(result => {
        res.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if(error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

// handler of requests with result to errors
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
