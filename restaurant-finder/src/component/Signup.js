import {
  TextInput,
  PasswordInput,
  Checkbox,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Button,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { postSignUp, selectAllAuth } from "../features/auth/authSlice";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const dispatch = useDispatch();
  const auth = useSelector(selectAllAuth);
  const navigate = useNavigate();

  const form = useForm({
    initialValues: { name: "", username: "", password: "" },

    // functions will be used to validate values at corresponding key
    validate: {
      name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
      username: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length < 6 ? "Password must have at least 6 characters" : null,
    },
  });

  const SignUpFormSubmit = (values) => {
    dispatch(postSignUp(values));
  };

  useEffect(() => {
    if (auth.username) {
      navigate("/");
    }
  }, [auth]);

  return (
    <Container size={420} my={40}>
      <Title
        align="center"
        sx={(theme) => ({
          fontFamily: `Greycliff CF, ${theme.fontFamily}`,
          fontWeight: 900,
        })}
      >
        Welcome back!
      </Title>
      <Text color="dimmed" size="sm" align="center" mt={5}>
        Already have an account?{" "}
        <Anchor size="sm" component={Link} to="/login">
          Sign In
        </Anchor>
      </Text>
      <Paper withBorder shadow="xl" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(SignUpFormSubmit)}>
          <TextInput
            label="Name"
            placeholder="Your Name"
            required
            {...form.getInputProps("name")}
          />
          <TextInput
            label="Email"
            placeholder="youremail@domain.com"
            mt="md"
            required
            {...form.getInputProps("username")}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            {...form.getInputProps("password")}
          />

          <Button fullWidth mt="xl" type="submit">
            Sign Up
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default SignUp;
