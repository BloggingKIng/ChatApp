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
  const [user, setUser] = useState([]);


  const fetchMembers = async() => {
    while (window.location.href.split("/").reverse()[0] === "") {
       new Promise((resolve) => setTimeout(resolve, 100));
    }
    await api.post(`/api/members/${window.location.href.split("/").reverse()[0]}/`)
    .then((response)=>{
      setMembers(response.data);
      console.log(response.data)
    })
  }

  const fetchUserDetails = async() => {
    await api.get(`/api/user_details/`)
    .then((response)=>{
      setUser(response.data);
      console.log(response.data);
    })
  }

  useEffect (() => {
    fetchUserDetails();
    fetchMembers();
},[])
  useEffect(() => {
    
    // Initialize WebSocket connection
    const chatSocket = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${window.location.href.split("/").reverse()[0]}/`
      );
      
      chatSocket.onmessage = function (e) {
        const data = JSON.parse(e.data).message;
        console.log(data);
        setMessages((prevMessages) => [...prevMessages, data]);
      };
      
      chatSocket.onclose = function (e) {
        console.error("Chat socket closed unexpectedly");
      };
      
      // Cleanup WebSocket connection on component unmount
      return () => {
        chatSocket.close();
      
      };
  });

  const handleSendMessage = () => {
    // Send message to WebSocket server
    const data = {
      message: messageInput,
      sent: true,
      sender: user,
      sentdate: new Date().toLocaleString(),
    }
    setMessages((prevMessages) => [...prevMessages, data]);
    const chatSocket = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${window.location.href.split("/").reverse()[0]}/`
    );

    chatSocket.onopen = function () {
      chatSocket.send(
        JSON.stringify(data)
      );
    };

    // Clear input after sending message
    setMessageInput("");
  };

  return (
    <>
      <Navbar />
    <MDBContainer fluid className="py-5" style={{ backgroundColor: "#eee", minHeight: "100vh", height: "100%" }}>
      <MDBRow>
        <MDBCol md="3" lg="3" xl="3" className="mb-4 mb-md-0">
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

                        <p className="fw-bold m-3 mb-1 text-center align-self-center">{member.user.username}{member.is_admin?" (Admin) ":""}</p>
                        <p className="text-center align-self-center">({member.user.email})</p>

                  </a>
                  ))
                }
                  
            </li>
            </MDBTypography>
            </MDBCardBody>
            </MDBCard>
        </MDBCol>

        <MDBCol md="6" lg="7" xl="8">
          <MDBTypography listUnStyled>
            {messages.map((data)=>(
              <li className={`d-flex ${data.sender.username === user.username? "justify-content-end" : "justify-content-start"} mb-4`}>
                  <MDBCard style={{flex:'.8'}}>
                    <MDBCardHeader className="d-flex justify-content-between p-3">
                      <p className="fw-bold mb-0">{data.sender.full_name} ({data.sender.username})</p>
                      <p className="text-muted small mb-0">
                        <MDBIcon far icon="clock" /> {data.sentdate}
                      </p>
                    </MDBCardHeader>
                    <MDBCardBody>
                      <p className="mb-0">
                        {data.message}
                      </p>
                    </MDBCardBody>
                  </MDBCard>
              </li>
              ))}
                
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
