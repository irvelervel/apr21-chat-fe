import { Col, Container, Form, Row } from 'react-bootstrap'
import { ChangeEvent, FormEvent, useState } from 'react'
import Message from '../types/Message'

const Home = () => {
  const [username, setUsername] = useState('')
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [message, setMessage] = useState('')

  const handleUsername = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('sending username...')
  }

  const handleMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('sending new message...')
  }

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
            />
          </Form>
        </Col>
        <Col md={2} style={{ borderLeft: '2px solid black' }}>
          <div>CONNECTED USERS GO HERE!</div>
        </Col>
      </Row>
    </Container>
  )
}

export default Home
