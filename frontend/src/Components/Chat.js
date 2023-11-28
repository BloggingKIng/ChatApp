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
  MDBCardFooter,
} from "mdb-react-ui-kit";
import Navbar from "./Navbar";
import api from "../api";
import './chat.css'
import {toast, ToastContainer} from 'react-toastify'
import { useNavigate } from "react-router-dom";
export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [members, setMembers] = useState([]);
  const [user, setUser] = useState([]);
  const [empty, setEmpty] = useState(false);
  const [requests, setRequests] = useState([]);

  const scroller = useRef(null);
  const navigator = useNavigate();


  const fetchMessages = () => {
    api
      .post(`/api/messages/`,{id:window.location.href.split("/").reverse()[0]})
      .then((response) => {
        setMessages(response.data);
      })
      .catch((error)=>{
        setEmpty(true);
      })
  }

  const fetchMembers = async() => {
    await api.post(`/api/members/${window.location.href.split("/").reverse()[0]}/`)
    .then((response)=>{
      setMembers(response.data);
      
    })
    .catch((error)=>{
      setEmpty(true);
    })
  
  }

  const fetchRequests = async() => {
    await api.post(`/api/requests/`,{id:window.location.href.split("/").reverse()[0]})
    .then((response)=>{
      setRequests(response.data);
      console.log(response.data)
      
    })
  }

  useEffect(()=>{
    setInterval(fetchRequests(),5000)
  },[])

  const fetchUserDetails = async() => {
    await api.get(`/api/user_details/`)
    .then((response)=>{
      setUser(response.data);
      console.log(response.data);
    })
  }

  useEffect (() => {
    fetchMessages();
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
        scroller.current.scrollIntoView({
          behavior: 'smooth',
        })
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
    if (!messageInput){
      return;
    }
    const data = {
      message: messageInput,
      sent: true,
      sender: user,
      sentdate: new Date().toLocaleString(),
      room: window.location.href.split("/").reverse()[0],
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

  useEffect(()=>{
    scroller.current.scrollIntoView({
      behavior: 'smooth',
    })
  },[messages])

  if (empty){
    navigator("/")
  }

  const handleAcceptRequest = (id) => {
    api.post(`/api/accept_decline_request/`,{id:id,action:'accept'})
    .then((response)=>{
      toast.success("Request Accepted!")
      fetchRequests();
      fetchMembers();
    })
  };
  const handleDeclineRequest = (id) => {
    api.post(`/api/accept_decline_request/`,{id:id,action:'decline'})
    .then((response)=>{
      toast.success("Request Declined!")
      fetchRequests();
      fetchMembers();
    })
  }

  return (
    <>
      <Navbar />
      <ToastContainer />
    <MDBContainer fluid className="py-5" style={{ backgroundColor: "#eee"}}>
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

        <MDBCol md="9" lg="9" xl="9">
          <MDBTypography listUnStyled style={{height:'70vh',overflowY:'auto'}} className="message-container">
            {messages.map((data)=>(
              <li className={`d-flex ${data.sender.username === user.username? "justify-content-end sent" : "justify-content-start"} m-4`}>
                  <MDBCard style={{flex:'.8'}}>
                    <MDBCardHeader className="d-flex justify-content-between" style={{padding:'1px'}}>
                      <p className="fw-bold mb-0" style={{padding:'10px'}}>{data.sender.username === user.username?`You (${data.sender.username})`: `${data.sender.full_name} (${data.sender.username})`}</p>
                      <p className="text-muted small mb-0" style={{padding:'10px'}}>
                        <MDBIcon far icon="clock" /> {data.sent? data.sentdate : new Date(data.sentdate).toLocaleString()}
                      </p>
                    </MDBCardHeader>
                    <MDBCardBody style={{padding:'10px'}}>
                      <p className="mb-0">
                        {data.message}
                      </p>
                    </MDBCardBody>
                  </MDBCard>
              </li>
              ))}
              {requests.map((request) => (
            <li key={request.id} className="d-flex justify-content-between m-4">
              <MDBCard style={{ flex: '.8' }}>
                    <MDBCardHeader className="d-flex justify-content-between" style={{padding:'1px'}}>
                      <p className="fw-bold mb-0" style={{padding:'10px'}}>{request.requester.full_name} ({request.requester.username})</p>
                      <p className="text-muted small mb-0" style={{padding:'10px'}}>
                        <MDBIcon far icon="clock" /> {new Date(request.sentdate).toLocaleString()}
                      </p>
                    </MDBCardHeader>
                <MDBCardBody>
                  <p className="mb-0">{request.request_message}!</p>
                </MDBCardBody>
                <MDBCardFooter>
                <MDBBtn color="success" style={{ borderRadius: '0px', marginRight: '8px' }} onClick={() => handleAcceptRequest(request.id)}>
                  Accept
                </MDBBtn>
                <MDBBtn color="danger" style={{ borderRadius: '0px' }} onClick={() => handleDeclineRequest(request.id)}>
                  Decline
                </MDBBtn>
                </MDBCardFooter>
              </MDBCard>
              
            </li>
          ))}
            <div ref={scroller}></div> 
              </MDBTypography>
            <div className="bg-white d-flex">
              <MDBTextArea
                label="Message"
                id="textAreaExample"
                
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                style={{ flex: "1", borderRadius: "10px", resize:'none' }}
              />

              <MDBBtn color="info" style={{borderRadius:'0px', marginLeft:'-8px'}} rounded onClick={handleSendMessage}>
                <MDBIcon fas icon="angle-right" style={{fontSize:'20px'}}/>
              </MDBBtn>
            </div>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
    </>

  );
}
