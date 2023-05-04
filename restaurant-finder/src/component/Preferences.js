import { Container, Paper, Text } from "@mantine/core";
import { useSelector } from "react-redux";
import { selectAllAuth } from "../features/auth/authSlice";

const Preferences = () => {
  const user = useSelector(selectAllAuth);

  return (
    <Container>
      <Paper shadow="xl" p="md" withBorder></Paper>
    </Container>
  );
};

export default Preferences;
