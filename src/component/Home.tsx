import { Col, Container, Form, Row } from 'react-bootstrap'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import Message from '../types/Message'
import { io } from 'socket.io-client'
import User from '../types/User'

// io is taking two arguments: the ADDRESS of the server and a config object
const ADDRESS = 'http://localhost:3030'
const socket = io(ADDRESS, { transports: ['websocket'] })
// right when io is executed, our connection is initialized
// so the server is aware of us and the communication can start

// every time our client connects to the server with the io function
// the server receives this connection
// and will emit a 'connect' event automatically for us

const Home = () => {
  const [username, setUsername] = useState('')
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [message, setMessage] = useState('')

  const [loggedin, setLoggedin] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])

  const handleUsername = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('sending username...')
    socket.emit('setUsername', { username: username })

    // by the way, on the server...
    // socket.on('setUsername', ({username}) => {})
  }

  const handleMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loggedin) {
      console.log('sending new message...')
      const newMessage = {
        text: message,
        sender: username,
        timestamp: Date.now(),
        id: socket.id,
      }
      socket.emit('sendmessage', newMessage)
      setChatHistory([...chatHistory, newMessage])
      setMessage('')
    }
  }

  const checkOnlineUsers = async () => {
    try {
      const response = await fetch(ADDRESS + '/online-users')
      const data = await response.json()
      setOnlineUsers(data.onlineUsers as User[])
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    // here we are starting our event listeners
    socket.on('connect', () => {
      // this one is coming from socket.io
      // now we're doing things every time the connection event happens
      console.log("I'm connected to the server!")
    })
    // once we're connected to the server, we can send our username
    // once you send correctly your username, you'll receive an event back! 'loggedin'
    socket.on('loggedin', () => {
      // username was saved correctly on the server, now we're allowed to send messages!
      console.log('Successfully logged in!')
      setLoggedin(true)
      checkOnlineUsers()
      socket.on('message', (message: Message) => {
        console.log('a new message was received!')
        // this is for ALL THE CLIENTS EXCEPT the one who emitted the message
        setChatHistory([...chatHistory, message])
      })
    })

    socket.on('newConnection', () => {
      // oh, a new user logged in! let's fetch the online-user route again!
      console.log('new user logged in!')
      checkOnlineUsers()
    })

    return () => {
      // componentWillUnmount
      socket.disconnect()
    }
  }, [])

  // client connects to the server
  // server gives the client back a "connect" event and the clients listens for it
  // now the client is able to send its username
  // the server accepts it and emit back a "loggedin" event
  // the client listens for it, and now it's ready to send messages!
  // for sending a message, a client emits an event called 'sendmessage' with the message
  // object as the payload, and also adds it to its chatHistory array
  // the server receives it and bounces it back to all the other clients connected
  // on the client we also set a 'message' event listener to capture the event emitted from the server
  // if triggered, this event listener takes the message out of the payload and adds it to its
  // chatHistory array
  // when a user disconnects, the backend will update the user list removing him/her
  // and will emit a newConnection event for letting all the other clients know that they should
  // fetch the users list once again to keep their connected clients list up-to-date

  return (
    <Container fluid>
      <Row className="my-3" style={{ height: '95vh' }}>
        <Col md={10} className="d-flex flex-column justify-content-between">
          {/* 3 components: username input field, chat history, message input field */}
          <Form onSubmit={handleUsername}>
            <Form.Control
              placeholder="Set username here"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              disabled={loggedin}
            />
          </Form>
          <ul>
            {chatHistory.map((message) => (
              <li key={message.id} className="my-2">
                <strong>{message.sender}</strong>
                <span className="mx-1"> | </span>
                <span>{message.text}</span>
                <span className="ml-2" style={{ fontSize: '0.7em' }}>
                  {new Date(message.timestamp).toLocaleTimeString('en-US')}
                </span>
              </li>
            ))}
          </ul>
          <Form onSubmit={handleMessage}>
            <Form.Control
              placeholder="Write message here"
              value={message}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
              disabled={!loggedin}
            />
          </Form>
        </Col>
        <Col md={2} style={{ borderLeft: '2px solid black' }}>
          <div>Connected users</div>
          <ul>
            {onlineUsers.map((user) => (
              <li key={user.id}>{user.username}</li>
            ))}
          </ul>
        </Col>
      </Row>
    </Container>
  )
}

export default Home
