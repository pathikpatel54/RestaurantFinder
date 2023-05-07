import {
  Autocomplete,
  Button,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Paper,
  Select,
  SimpleGrid,
  Skeleton,
  Space,
  Stepper,
  Text,
  TextInput,
  Title,
  createStyles,
  rem,
} from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { selectAllAuth } from "../features/auth/authSlice";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  addCompanion,
  fetchCompanion,
  selectAllCompanion,
} from "../features/companion/companionSlice";
import useWebSocket from "../hooks/useWebSocket";
import {
  sendMessage, // Import the sendMessage function
} from "../features/companion/websocketSlice";
import { json } from "react-router-dom";
import {
  fetchCuisines,
  selectAllCuisines,
} from "../features/companion/cuisineSlice";
import { SliderInput } from "./SliderInput";
import { useForm } from "@mantine/form";
import Cards from "./Cards";

const useStyles = createStyles((theme) => ({
  root: {
    position: "relative",
  },

  input: {
    height: rem(61),
    paddingTop: rem(25),
  },

  label: {
    position: "absolute",
    pointerEvents: "none",
    fontSize: theme.fontSizes.sm,
    paddingLeft: theme.spacing.sm,
    paddingTop: rem(8),
    zIndex: 1,
  },
}));

const Landing = () => {
  const { classes } = useStyles();
  const user = useSelector(selectAllAuth);
  const companion = useSelector(selectAllCompanion);
  const cuisines = useSelector(selectAllCuisines);
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
  const dispatch = useDispatch();
  const { status, messages } = useWebSocket("/api/socket");
  const [message, setMessage] = useState({});
  const [waiting, setWaiting] = useState(false);

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

  const form = useForm({
    initialValues: {
      cuisine: "",
      maxPrice: 20,
      maxDistance: 5,
      cuisineImp: 5,
      priceImp: 5,
      distanceImp: 5,
    },

    // functions will be used to validate values at corresponding key
    validate: {
      cuisine: (value) => (value.length === 0 ? "Cuisine is required" : null),
      maxPrice: (value) =>
        value < 10 || value > 200 ? "Price Should be in range 10-200" : null,
      maxDistance: (value) =>
        value < 1 || value > 50 ? "Distance Should be in range 1-50" : null,
      cuisineImp: (value) =>
        value < 1 || value > 10 ? "Value Should be in range 1-10" : null,
      priceImp: (value) =>
        value < 1 || value > 10 ? "Value Should be in range 1-10" : null,
      distanceImp: (value) =>
        value < 1 || value > 10 ? "Value Should be in range 1-10" : null,
    },
  });

  const handleFormSubmit = (values) => {
    sendMessageToServer({
      type: "preference",
      companionId: companion?._id,
      userPreference: values,
    });
    setActive(2);
    setWaiting(true);
  };

  const handleNext = () => {
    if (!active) {
      const validRegex =
        /^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)$/;
      const lowerEmail = email.toLowerCase();
      const isValidEmail =
        lowerEmail.match(validRegex) && lowerEmail !== user?.username;
      const isAddressValid = address.length > 0;

      if (isValidEmail && isAddressValid) {
        dispatch(
          addCompanion({ username1: user.username, username2: email, address })
        );
      } else {
        if (!isValidEmail) setEmailError("Email address invalid");
        if (!isAddressValid) setAddressError("Address is required");
      }
    } else if (active === 1) {
    } else {
      nextStep();
    }
  };

  useEffect(() => {
    if (active === 1) {
      setWaiting(true);

      sendMessageToServer({
        type: "subscribe",
        companionId: companion._id,
      });
    }
  }, [active]);

  useEffect(() => {
    dispatch(fetchCuisines());
    dispatch(fetchCompanion());
  }, []);

  const sendMessageToServer = async (message) => {
    sendMessage(message);
  };

  useEffect(() => {
    if (companion.address && companion.username1) {
      setAddress(companion.address);
      if (user.username !== companion.username1) {
        setEmail(companion.username1);
      } else {
        setEmail(companion.username2);
      }
      setActive(1);
    }
  }, [companion]);

  useEffect(() => {
    try {
      const lastMessage = JSON.parse(messages?.slice(-1)[0]);
      if (lastMessage?.type !== "pong") {
        setMessage(lastMessage);
      }
      if (lastMessage?.type === "disconnected") {
        setWaiting(true);
      } else if (lastMessage?.type === "presence") {
        setWaiting(false);
      } else if (lastMessage?.type === "sortedRestaurants") {
        setWaiting(false);
      }
    } catch (e) {
      console.log(e);
    }
  }, [messages]);

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
        <Stepper active={active} breakpoint="sm">
          <Stepper.Step label="First step" description="Enter your address">
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
          <Stepper.Step
            label="Second step"
            description="Select your preferences"
          >
            <Divider my="sm" />
            <Space h={10}></Space>

            <Text style={{ textAlign: "center" }} mb={20}>
              {waiting
                ? "Waiting for your companion to join this app. Ask them to open this app and sign up if they haven't already."
                : "Your companion has joined the app, Help us match you with the perfect restaurant!"}
            </Text>
            <form
              onSubmit={form.onSubmit(handleFormSubmit)}
              style={{ position: "relative" }}
            >
              <SimpleGrid cols={2}>
                <LoadingOverlay visible={waiting} overlayBlur={2} />

                <div style={{ borderRight: "1px solid", padding: "20px" }}>
                  <Text mb={10}>
                    What kind of food are you in the mood for?
                  </Text>
                  <Select
                    label="Cuisine"
                    placeholder="Pick one"
                    searchable
                    nothingFound="No options"
                    maxDropdownHeight={280}
                    data={cuisines}
                    classNames={classes}
                    {...form.getInputProps("cuisine")}
                  />
                  <Text mb={10} mt={20}>
                    How important cuisine is in decision making process?
                  </Text>
                  <SliderInput
                    label="Cuisine Importance"
                    max={10}
                    min={1}
                    step={1}
                    {...form.getInputProps("cuisineImp")}
                  />

                  <Text mb={10} mt={20}>
                    How far do you want to travel for restaurant?
                  </Text>
                  <SliderInput
                    label="Max distance (miles)"
                    placeholder="5 miles is an average value"
                    max={50}
                    min={1}
                    step={1}
                    {...form.getInputProps("maxDistance")}
                  />
                </div>
                <div style={{ padding: "20px" }}>
                  <Text mb={10}>What's your price range?</Text>
                  <SliderInput
                    label="Max price ($)"
                    placeholder="$20 is an average price"
                    max={200}
                    min={10}
                    step={5}
                    {...form.getInputProps("maxPrice")}
                  />
                  <Text mb={10} mt={20}>
                    How important price is in decision making process?
                  </Text>
                  <SliderInput
                    label="Price Importance"
                    placeholder="$20 is an average price"
                    max={10}
                    min={1}
                    step={1}
                    {...form.getInputProps("priceImp")}
                  />
                  <Text mb={10} mt={20}>
                    How important distance is in decision making process?
                  </Text>
                  <SliderInput
                    label="Distance Importance"
                    placeholder="5 miles is an average value"
                    max={10}
                    min={1}
                    step={1}
                    {...form.getInputProps("distanceImp")}
                  />
                </div>
              </SimpleGrid>
              <Group position="center" mt="xl">
                <Button variant="default" onClick={prevStep}>
                  Back
                </Button>
                <Button type="submit">Next step</Button>
              </Group>
            </form>
          </Stepper.Step>
          <Stepper.Step label="Final step" description="Select your restaurant">
            <Divider my="sm" />
            <Space h={10}></Space>

            <Text style={{ textAlign: "center" }} mb={20}>
              {waiting
                ? "Waiting for your companion to complete seletcting their preferences."
                : "These are the restaurants sorted according to both the preferences."}
            </Text>
            {message.restaurants ? <Cards data={message.restaurants} /> : <></>}
            <Skeleton visible={waiting} height={50} mb="xl"></Skeleton>
            <Skeleton visible={waiting} height={50} mb="xl"></Skeleton>
            <Skeleton visible={waiting} height={50} mb="xl"></Skeleton>
            <Skeleton visible={waiting} height={50} mb="xl"></Skeleton>
          </Stepper.Step>
          <Stepper.Completed></Stepper.Completed>
        </Stepper>
        {active === 0 ? (
          <Group position="center" mt="xl">
            <Button variant="default" onClick={prevStep}>
              Back
            </Button>
            <Button onClick={handleNext}>Next step</Button>
          </Group>
        ) : (
          <></>
        )}
      </Paper>
    </Container>
  );
};

export default Landing;
