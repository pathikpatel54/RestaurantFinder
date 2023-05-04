import {
  Title,
  Text,
  Container,
  Button,
  createStyles,
  rem,
} from "@mantine/core";
import { Link } from "react-router-dom";

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "relative",
    paddingTop: rem(150),
    paddingBottom: rem(130),

    backgroundSize: "cover",
    backgroundPosition: "center",

    [theme.fn.smallerThan("xs")]: {
      paddingTop: rem(80),
      paddingBottom: rem(50),
    },
  },

  inner: {
    position: "relative",
    zIndex: 1,
  },

  title: {
    fontWeight: 800,
    fontSize: rem(40),
    letterSpacing: rem(-1),
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    color: theme.white,
    marginBottom: theme.spacing.xs,
    textAlign: "center",
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,

    [theme.fn.smallerThan("xs")]: {
      fontSize: rem(28),
      textAlign: "left",
    },
  },

  highlight: {
    color: theme.colors[theme.primaryColor][4],
  },

  description: {
    color: theme.colors.gray[0],
    textAlign: "center",

    [theme.fn.smallerThan("xs")]: {
      fontSize: theme.fontSizes.md,
      textAlign: "left",
    },
  },

  controls: {
    marginTop: `calc(${theme.spacing.xl} * 1.5)`,
    display: "flex",
    justifyContent: "center",
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,

    [theme.fn.smallerThan("xs")]: {
      flexDirection: "column",
    },
  },

  control: {
    height: rem(42),
    fontSize: theme.fontSizes.md,

    "&:not(:first-of-type)": {
      marginLeft: theme.spacing.md,
    },

    [theme.fn.smallerThan("xs")]: {
      "&:not(:first-of-type)": {
        marginTop: theme.spacing.md,
        marginLeft: 0,
      },
    },
  },

  secondaryControl: {
    color: theme.white,
    backgroundColor: "rgba(255, 255, 255, .4)",

    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, .45) !important",
    },
  },
}));

const Home = () => {
  const { classes, cx } = useStyles();

  return (
    <div className={classes.wrapper}>
      <div className={classes.inner}>
        <Title className={classes.title}>
          The Ultimate Restaurant{" "}
          <Text component="span" inherit className={classes.highlight}>
            Decision Maker
          </Text>
        </Title>

        <Container size={640}>
          <Text size="lg" className={classes.description}>
            Struggling to decide where to eat with your partner/roommate/friend?
            <Text size="lg" className={classes.description}>
              Let our web app help you both prioritize and choose a fair dining
              spot!
            </Text>
          </Text>
        </Container>

        <div className={classes.controls}>
          <Button
            className={classes.control}
            variant="white"
            size="lg"
            component={Link}
            to="/signup"
          >
            Get Started{" "}
          </Button>
          <Button
            className={cx(classes.control, classes.secondaryControl)}
            size="lg"
            component={Link}
            to="/login"
          >
            Log In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
