import {
  Autocomplete,
  Button,
  Container,
  Divider,
  Group,
  List,
  Paper,
  Space,
  Stepper,
  Text,
  TextInput,
  Title,
  createStyles,
  rem,
} from "@mantine/core";
import { useSelector } from "react-redux";
import { selectAllAuth } from "../features/auth/authSlice";
import { useEffect, useState } from "react";
import axios from "axios";

const useStyles = createStyles((theme) => ({
  root: {
    position: "relative",
  },

  input: {
    height: rem(54),
    paddingTop: rem(18),
  },

  label: {
    position: "absolute",
    pointerEvents: "none",
    fontSize: theme.fontSizes.xs,
    paddingLeft: theme.spacing.sm,
    paddingTop: `calc(${theme.spacing.sm} / 2)`,
    zIndex: 1,
  },
}));

const Landing = () => {
  const { classes } = useStyles();
  const user = useSelector(selectAllAuth);
  const [active, setActive] = useState(0);
  const nextStep = () =>
    setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  let data = [];

  const handleSearch = async (query) => {
    if (query !== "") {
      try {
        const response = await axios.get(
          `https://api.geoapify.com/v1/geocode/autocomplete`,
          {
            params: {
              apiKey: process.env.REACT_APP_SECRET_NAME,
              text: query,
              country: "US",
            },
          }
        );
        setSuggestions(response.data.features);
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    data = suggestions.map((suggestion) => suggestion.properties.formatted);
    console.log(data);
  }, [suggestions]);

  const handleNext = () => {
    if (active === 0) {
      const validRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      if (!email.toLowerCase().match(validRegex)) {
        setEmailError("Email address invalid");
      }
      if (address.length === 0) {
        setAddressError("Address is required");
      }
      if (emailError === "" && addressError === "") {
        console.log(email, address);
      }
    } else {
      nextStep();
    }
  };

  return (
    <Container>
      <Paper shadow="xl" p="md" withBorder>
        <Title order={3} style={{ textAlign: "center" }}>
          Welcome to the RestaurantFinder!
        </Title>
        <Space h={10}></Space>
        <Text style={{ textAlign: "center" }}>
          Let's help you find the perfect place to eat by understanding your
          preferences. It's quick and easy!
        </Text>
        <Space h={30}></Space>
        <Stepper active={active} onStepClick={setActive} breakpoint="sm">
          <Stepper.Step label="First step" description="Enter address">
            <Divider my="sm" />
            <Space h={10}></Space>

            <Text style={{ textAlign: "center" }}>
              Enter your address and email address of your companion who would
              be going out with you.
            </Text>
            <Autocomplete
              mt={20}
              classNames={classes}
              value={address}
              onChange={(value) => {
                setAddressError("");
                setAddress(value);
                handleSearch(value);
              }}
              placeholder="Enter your address"
              label="Address"
              data={suggestions.map(
                (suggestion) => suggestion.properties.formatted
              )}
              filter={() => true}
              withAsterisk
              error={addressError}
            />
            <TextInput
              mt={20}
              label="Enter email address of companion"
              placeholder="Companion email address"
              classNames={classes}
              value={email}
              onChange={(e) => {
                setEmailError("");
                setEmail(e.target.value);
              }}
              withAsterisk
              error={emailError}
            />
          </Stepper.Step>
          <Stepper.Step label="Second step" description="Verify email">
            Step 2 content: Verify email
          </Stepper.Step>
          <Stepper.Step label="Final step" description="Get full access">
            Step 3 content: Get full access
          </Stepper.Step>
          <Stepper.Completed>
            Completed, click back button to get to previous step
          </Stepper.Completed>
        </Stepper>
        <Group position="center" mt="xl">
          <Button variant="default" onClick={prevStep}>
            Back
          </Button>
          <Button onClick={handleNext}>Next step</Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default Landing;
