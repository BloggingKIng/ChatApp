import React, { useEffect, useRef, useState } from "react";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBIcon,
  MDBTypography,
  MDBTextArea,
  MDBCardHeader,
  MDBBtn,
} from "mdb-react-ui-kit";
import Navbar from "./Navbar";
import api from "../api";
import { toast } from "react-toastify";
export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const chatLogRef = useRef(null);
  const [members, setMembers] = useState([]);


  const fetchMembers = async() => {
    await api.post(`/api/members/${window.location.href.split("/").reverse()[0]}/`)
    .then((response)=>{
      setMembers(response.data);
      console.log(response.data)
    })
  } 
  useEffect(() => {
    // Initialize WebSocket connection
    const chatSocket = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${window.location.href.split("/")[4]}/`
      );
      
      chatSocket.onmessage = function (e) {
        const data = JSON.parse(e.data);
        setMessages((prevMessages) => [...prevMessages, data]);
        chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
      };
      
      chatSocket.onclose = function (e) {
        console.error("Chat socket closed unexpectedly");
      };
      
      // Cleanup WebSocket connection on component unmount
      return () => {
        chatSocket.close();
      
      fetchMembers();
      };
  }, []);

  const handleSendMessage = () => {
    // Send message to WebSocket server
    const chatSocket = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${window.location.href.split("/ws/")[-1]}/`
    );

    chatSocket.onopen = function () {
      chatSocket.send(
        JSON.stringify({
          message: messageInput,
          sent: true,
        })
      );
    };

    // Clear input after sending message
    setMessageInput("");
  };

  return (
    <>
      <Navbar />
    <MDBContainer fluid className="py-5" style={{ backgroundColor: "#eee" }}>
      <MDBRow>
        <MDBCol md="6" lg="5" xl="4" className="mb-4 mb-md-0">
          <MDBCard>
            <MDBCardBody>
            <h2 className="font-weight-bold mb-3 text-center text-center">
               Members
              </h2>
          <MDBTypography listUnStyled className="mb-0">
          <li
                  className="p-2 border-bottom"
                >
                  {members.map((member) => (
                    <a  className="d-flex justify-content-center mb-4 text-center" style={{flexDirection:'column',background:'#eee'}} key={member.id}>

                        <p className="fw-bold m-3 mb-1 text-center align-self-center">{member.user.username}</p>
                        <p className="text-center align-self-center">({member.user.email})</p>

                  </a>
                  ))
                }
                  
            </li>
            </MDBTypography>
            </MDBCardBody>
            </MDBCard>
          <MDBCard>
            <MDBCardBody>
              <MDBTypography listUnStyled className="mb-0">
                {messages.map((data, index) => (
                  <li
                    key={index}
                    className={`p-2 border-bottom ${
                      index % 2 === 0 ? "bg-white" : "bg-light"
                    }`}
                  >
                    <a
                      href="#!"
                      className="d-flex justify-content-between"
                    >
                      <div className="d-flex flex-row">
                        <img
                          src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-8.webp"
                          alt="avatar"
                          className="rounded-circle d-flex align-self-center me-3 shadow-1-strong"
                          width="60"
                        />
                        <div className="pt-1">
                          <p className="fw-bold mb-0">{data.sender}</p>
                          <p className="small text-muted">{data.message}</p>
                        </div>
                      </div>
                      <div className="pt-1">
                        <p className="small text-muted mb-1">{data.sentDate}</p>
                      </div>
                    </a>
                  </li>
                ))}
              </MDBTypography>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>

        <MDBCol md="6" lg="7" xl="8">
          <MDBTypography listUnStyled>
            <li className="d-flex justify-content-between mb-4">
              <img
                src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-6.webp"
                alt="avatar"
                className="rounded-circle d-flex align-self-start me-3 shadow-1-strong"
                width="60"
              />
              <MDBCard>
                <MDBCardHeader className="d-flex justify-content-between p-3">
                  <p className="fw-bold mb-0">Brad Pitt</p>
                  <p className="text-muted small mb-0">
                    <MDBIcon far icon="clock" /> 12 mins ago
                  </p>
                </MDBCardHeader>
                <MDBCardBody>
                  <p className="mb-0">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                </MDBCardBody>
              </MDBCard>
            </li>
            <li className="d-flex justify-content-between mb-4">
              <MDBCard className="w-100">
                <MDBCardHeader className="d-flex justify-content-between p-3">
                  <p className="fw-bold mb-0">Lara Croft</p>
                  <p className="text-muted small mb-0">
                    <MDBIcon far icon="clock" /> 13 mins ago
                  </p>
                </MDBCardHeader>
                <MDBCardBody>
                  <p className="mb-0">
                    Sed ut perspiciatis unde omnis iste natus error sit
                    voluptatem accusantium doloremque laudantium.
                  </p>
                </MDBCardBody>
              </MDBCard>
              <img
                src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-5.webp"
                alt="avatar"
                className="rounded-circle d-flex align-self-start ms-3 shadow-1-strong"
                width="60"
              />
            </li>
            <li className="d-flex justify-content-between mb-4">
              <img
                src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-6.webp"
                alt="avatar"
                className="rounded-circle d-flex align-self-start me-3 shadow-1-strong"
                width="60"
              />
              <MDBCard>
                <MDBCardHeader className="d-flex justify-content-between p-3">
                  <p className="fw-bold mb-0">Brad Pitt</p>
                  <p className="text-muted small mb-0">
                    <MDBIcon far icon="clock" /> 10 mins ago
                  </p>
                </MDBCardHeader>
                <MDBCardBody>
                  <p className="mb-0">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                </MDBCardBody>
              </MDBCard>
            </li>
            <li className="bg-white mb-3">
              <MDBTextArea
                label="Message"
                id="textAreaExample"
                rows={4}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
            </li>
            <MDBBtn color="info" rounded className="float-end" onClick={handleSendMessage}>
              Send
            </MDBBtn>
          </MDBTypography>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
    </>

  );
}
