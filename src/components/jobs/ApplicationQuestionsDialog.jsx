import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";

export default function ApplicationQuestionsDialog({ job, open, loading, onClose, onSubmit }) {
  const questions = job?.screening_questions || [];
  const [answers, setAnswers] = useState({});

  useEffect(() => { if (open) setAnswers({}); }, [open, job?.id]);

  const complete = questions.every((question) => String(answers[question.id] || "").trim());

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Preguntas de la empresa</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" mb={2}>
          Responde todas las preguntas para enviar tu postulación a {job?.title}.
        </Typography>
        <Stack spacing={2}>
          {questions.map((question) => (
            <TextField
              key={question.id}
              required
              fullWidth
              select={question.question_type === "YES_NO"}
              multiline={question.question_type === "TEXT"}
              minRows={question.question_type === "TEXT" ? 2 : undefined}
              label={question.question_text}
              value={answers[question.id] || ""}
              onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
            >
              {question.question_type === "YES_NO" && [
                <MenuItem key="YES" value="Sí">Sí</MenuItem>,
                <MenuItem key="NO" value="No">No</MenuItem>,
              ]}
            </TextField>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={!complete || loading}
          onClick={() => onSubmit(questions.map((question) => ({
            question_id: question.id,
            answer_text: answers[question.id],
          })))}
        >
          {loading ? "Enviando..." : "Enviar postulación"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
