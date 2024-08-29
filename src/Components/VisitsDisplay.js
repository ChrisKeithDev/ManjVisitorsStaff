// src/Components/VisitsDisplay.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Card, Container, Row, Col, InputGroup, FormControl, Button } from 'react-bootstrap';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const VisitsDisplay = () => {
  const [entries, setEntries] = useState([]);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "visits"), orderBy("dateTime", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newEntries = snapshot.docs.map(doc => {
        // Include processing for the signOutTime
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dateTime: data.dateTime?.toDate(),
          signOutTime: data.signOutTime?.toDate(),
        };
      });
      setEntries(newEntries);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate('/login'); // Redirect to login page after successful logout
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Function to sign out a visitor
  const signOutVisitor = async (id) => {
    const visitorRef = doc(db, "visits", id);
    await updateDoc(visitorRef, {
      signOutTime: new Date() // Set the current date and time as sign-out time
    });
  };

  const filteredEntries = entries.filter(entry =>
    entry.name.toLowerCase().includes(searchText.toLowerCase()) ||
    entry.address.toLowerCase().includes(searchText.toLowerCase()) ||
    entry.purpose.toLowerCase().includes(searchText.toLowerCase()) ||
    (entry.dateTime && entry.dateTime.toLocaleString().toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <Container fluid style={{ backgroundColor: '#E6E4D3', padding: '20px' }}>
      <Row className="justify-content-between">
        <Col xs={12} md={6}>
          <InputGroup className="mb-3">
            <FormControl
              placeholder="Filter"
              onChange={(e) => setSearchText(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col xs={12} md={3} className="text-md-right mb-3">
          <Button onClick={handleLogout} variant="outline-secondary">Logout</Button> {/* Logout Button */}
        </Col>
      </Row>
      <Row>
        {filteredEntries.map((entry) => (
          <Col key={entry.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{entry.name}</Card.Title>
                <Card.Text>{entry.address}</Card.Text>
                <Card.Text>Purpose: {entry.purpose}</Card.Text>
                <Card.Text>Signed in: {entry.dateTime?.toLocaleString()}</Card.Text>
                {/* Only show the Sign Out button if signOutTime is not set */}
                {!entry.signOutTime && (
                  <Button variant="primary" onClick={() => signOutVisitor(entry.id)}>Sign Visitor Out</Button>
                )}
                {/* Display signOutTime if it exists */}
                {entry.signOutTime && (
                  <Card.Text>Signed out: {entry.signOutTime.toLocaleString()}</Card.Text>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default VisitsDisplay;
