import React, { useState } from 'react';
import {
  MDBNavbar,
  MDBContainer,
  MDBIcon,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarLink,
  MDBBtn,
  MDBNavbarToggler,
  MDBNavbarBrand,
  MDBCollapse
} from 'mdb-react-ui-kit';
import './navbar.css';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [openNavColorThird, setOpenNavColorThird] = useState(false);
  const navigate = useNavigate();
  const loggedIn = JSON.parse(localStorage.getItem('loggedIn'));
  const handleClick = () => {
    if (loggedIn) {
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/login');
    } else {
      navigate('/register');
    }
  }
  return (
    <>
      <MDBNavbar expand='lg' dark bgColor='primary'>
        <MDBContainer fluid>
          
          <MDBNavbarBrand href='/' className='heading'>Echat</MDBNavbarBrand>
          <MDBNavbarToggler
            type='button'
            data-target='#navbarColor02'
            aria-controls='navbarColor02'
            aria-expanded='false'
            aria-label='Toggle navigation'
            onClick={() => setOpenNavColorThird(!openNavColorThird)}
          >
            <MDBIcon icon='bars' fas />
          </MDBNavbarToggler>
          <MDBCollapse open={openNavColorThird} navbar>
            <MDBNavbarNav className='me-auto mb-2 mb-lg-0' style={{justifyContent:'flex-end'}}>
              <MDBNavbarItem>
                <MDBBtn className='me-2 btn-success' type='button' onClick={handleClick}>
                    {loggedIn ? 'Logout' : 'Signup'}
                </MDBBtn>
              </MDBNavbarItem>
            </MDBNavbarNav>
          </MDBCollapse>
        </MDBContainer>
      </MDBNavbar>
    </>
  );
}