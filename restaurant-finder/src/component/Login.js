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
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDispatch, useSelector } from "react-redux";
import { postLogin, selectAllAuth } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getAuthError } from "../features/auth/authSlice";
import { getAuthStatus } from "../features/auth/authSlice";
import { notifications } from "@mantine/notifications";

const Login = () => {
  const dispatch = useDispatch();
  const LoginFormSubmit = (values) => {
    dispatch(postLogin(values));
  };
  const auth = useSelector(selectAllAuth);
  const error = useSelector(getAuthError);
  const status = useSelector(getAuthStatus);

  const navigate = useNavigate();

  const form = useForm({
    initialValues: { username: "", password: "" },

    // functions will be used to validate values at corresponding key
    validate: {
      username: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length < 6 ? "Password must have at least 6 letters" : null,
    },
  });

  useEffect(() => {
    if (error === "Request failed with status code 404") {
      notifications.clean();
      notifications.show({
        title: "Authentication failed",
        message: "User does not exist",
      });
    } else if (error === "Request failed with status code 403") {
      notifications.clean();
      notifications.show({
        title: "Authentication failed",
        message: "Username or Password is incorrect",
      });
    }
  }, [status]);

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
        Do not have an account yet?{" "}
        <Anchor size="sm" component={Link} to="/signup">
          Create account
        </Anchor>
      </Text>

      <Paper withBorder shadow="xl" p={30} mt={30} radius="md">
        <form
          onSubmit={form.onSubmit(LoginFormSubmit)}
          style={{ position: "relative" }}
        >
          <LoadingOverlay visible={status === "pending"} overlayBlur={2} />
          <TextInput
            label="Email"
            placeholder="you@mantine.dev"
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
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
