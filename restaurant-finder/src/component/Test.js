// Mantine UI version

import React, { useEffect, useState } from "react";
import { Autocomplete } from "@mantine/core";
import axios from "axios";

function AddressInput() {
  const [value, setValue] = useState("");
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

  return (
    <Autocomplete
      value={value}
      onChange={(value) => {
        setValue(value);
        handleSearch(value);
      }}
      placeholder="Enter an address"
      label="Address"
      data={suggestions.map((suggestion) => suggestion.properties.formatted)}
      filter={() => true}
    />
  );
}

export default AddressInput;
