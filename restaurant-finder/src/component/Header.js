import { useEffect, useState } from "react";
import {
  createStyles,
  Header,
  Container,
  Group,
  Burger,
  Paper,
  Transition,
  Image,
  Button,
  Menu,
  UnstyledButton,
  Avatar,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, useLocation } from "react-router-dom";
import { selectAllAuth } from "../features/auth/authSlice";
import { useSelector } from "react-redux";
import { IconLogout, IconChevronDown, IconSettings } from "@tabler/icons-react";
import { rem } from "@mantine/core";

const HEADER_HEIGHT = 60;

const useStyles = createStyles((theme) => ({
  root: {
    position: "relative",
    zIndex: 1,
  },

  dropdown: {
    position: "absolute",
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,
    overflow: "hidden",
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
    zIndex: "2",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
  },

  links: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  burger: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  link: {
    display: "block",
    lineHeight: 1,
    padding: "8px 12px",
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },

    [theme.fn.smallerThan("sm")]: {
      borderRadius: 0,
      padding: theme.spacing.md,
    },
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).color,
    },
  },
  user: {
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
    transition: "background-color 100ms ease",

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
    },

    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },
  usermenu: {
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
    transition: "background-color 100ms ease",

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
    },
  },
  userActive: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
  },
}));

const links = [
  { link: "/", label: "Home" },
  { link: "/favorites", label: "Favorite Restaurants" },
  { link: "/preferences", label: "Preferences" },
];

export default function HeaderResponsive() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [active, setActive] = useState(links[0].link);
  const { classes, cx, theme } = useStyles();
  const path = useLocation();
  const user = useSelector(selectAllAuth);
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  useEffect(() => {
    setActive(path.pathname);
  }, [path]);

  const items = links.map((link) => (
    <Link
      key={link.label}
      to={link.link}
      className={cx(classes.link, {
        [classes.linkActive]: active === link.link,
      })}
      onClick={() => {
        setActive(link.link);
        close();
      }}
    >
      {link.label}
    </Link>
  ));

  return (
    <Header height={HEADER_HEIGHT} mb={80} className={classes.root}>
      <Container className={classes.header} size={"xl"}>
        <Link
          to="/"
          style={{ textDecoration: "none" }}
          onClick={() => {
            setActive("/");
          }}
        >
          <Image src="logo.png" maw={170} />
        </Link>

        <Group spacing={5} className={classes.links}>
          {user.username ? items : <></>}
        </Group>
        {user.username ? (
          <Menu
            width={260}
            position="bottom-end"
            transitionProps={{ transition: "pop-top-right" }}
            onClose={() => setUserMenuOpened(false)}
            onOpen={() => setUserMenuOpened(true)}
            withinPortal
          >
            <Menu.Target>
              <UnstyledButton
                className={cx(classes.user, {
                  [classes.userActive]: userMenuOpened,
                })}
              >
                <Group spacing={7}>
                  <Avatar
                    src={user.image}
                    alt={user.name}
                    radius="xl"
                    size={20}
                  />
                  <Text weight={500} size="sm" sx={{ lineHeight: 1 }} mr={3}>
                    {user.name}
                  </Text>
                  <IconChevronDown size={rem(12)} stroke={1.5} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                icon={<IconSettings size="0.9rem" stroke={1.5} />}
                component={Link}
                to="/preferences"
              >
                Preferences
              </Menu.Item>
              <Menu.Item
                color="red"
                icon={<IconLogout size="0.9rem" stroke={1.5} />}
                component="a"
                href="/api/logout"
              >
                Log Out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Group spacing={10} className={classes.links}>
            <Button variant="default" component={Link} to="/login">
              Log in
            </Button>
            <Button component={Link} to="/signup">
              Sign up
            </Button>
          </Group>
        )}

        <Burger
          opened={opened}
          onClick={toggle}
          className={classes.burger}
          size="sm"
        />

        <Transition transition="pop-top-right" duration={200} mounted={opened}>
          {(styles) => {
            return (
              <Paper className={classes.dropdown} withBorder style={styles}>
                {user.username ? items : <></>}
                {user.username ? (
                  <Menu
                    width={260}
                    position="bottom-end"
                    transitionProps={{ transition: "pop-top-right" }}
                    onClose={() => setUserMenuOpened(false)}
                    onOpen={() => setUserMenuOpened(true)}
                    withinPortal
                    styles={{
                      justifyContent: "center",
                    }}
                  >
                    <Menu.Target>
                      <UnstyledButton
                        className={cx(classes.usermenu, {
                          [classes.userActive]: userMenuOpened,
                        })}
                      >
                        <Group spacing={7}>
                          <Avatar
                            src={user.image}
                            alt={user.name}
                            radius="xl"
                            size={20}
                          />
                          <Text
                            weight={500}
                            size="sm"
                            sx={{ lineHeight: 1 }}
                            mr={3}
                          >
                            {user.name}
                          </Text>
                          <IconChevronDown size={rem(12)} stroke={1.5} />
                        </Group>
                      </UnstyledButton>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        icon={<IconLogout size="0.9rem" stroke={1.5} />}
                        component={Link}
                        to="/preferences"
                      >
                        Preferences
                      </Menu.Item>
                      <Menu.Item
                        color="red"
                        icon={<IconLogout size="0.9rem" stroke={1.5} />}
                        component="a"
                        href="/api/logout"
                      >
                        Log Out
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                ) : (
                  <Group
                    spacing={10}
                    style={{ padding: "10px", justifyContent: "center" }}
                  >
                    <Button variant="default" component={Link} to="/login">
                      Log in
                    </Button>
                    <Button component={Link} to="/signup">
                      Sign up
                    </Button>
                  </Group>
                )}
              </Paper>
            );
          }}
        </Transition>
      </Container>
    </Header>
  );
}
