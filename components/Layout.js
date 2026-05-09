import React from "react";
import { Container } from "semantic-ui-react";
import Header from "./Header";
const Layout = (props) => {
  return (
    <div>
    <Container >
      {/* <h1>I am the header</h1>     */}
      <Header></Header>
      {props.children}
    </Container>
    </div>
  );
};

export default Layout;
