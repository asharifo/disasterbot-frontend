import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Send } from "lucide-react";
import { useState } from "react";

function InputForm({ onSendMessage, disabled }) {
  const [message, setMessage] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="text-and-button">
      <TextField
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        variant="outlined"
        disabled={disabled}
        onKeyDown={handleKeyPress}
        multiline
        fullWidth
        maxRows={2}
        placeholder="Ask anything..."
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: "white",
            color: "black",
          },
          "& fieldset": {
            borderColor: "black",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#e0e1dd",
          }
        }}
      />
      <Button
        disabled={!message.trim() || disabled}
        type="submit"
        variant="contained"
        sx={{
          backgroundColor: "#415a77",
          color: "#fff",
          "&:hover": { backgroundColor: "#778da9" },
          "&.Mui-disabled": {
            backgroundColor: "#1b263b", // whatever you like
            color: "#ffffff",
          },
        }}
      >
        <Send />
      </Button>
    </form>
  );
}

export default InputForm;
