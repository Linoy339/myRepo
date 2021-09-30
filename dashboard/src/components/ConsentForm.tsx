// Core Imports
import React, { useEffect, useState } from "react"
import {
  makeStyles,
  TextField,
  Box,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  Button,
  Grid,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Backdrop,
  CircularProgress,
  FormHelperText,
} from "@material-ui/core"
import { useTranslation } from "react-i18next"
import { sign } from "jsonwebtoken"
import { Alert } from "@material-ui/lab"
const token = process.env.REACT_APP_PRIVATE_KEY

export const fetchResult = async (jwtToken, url) => {
  const baseUrl = "https://api.lampv2.unityhealth.to"
  let result = await (
    await fetch(`${baseUrl}/${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwtToken,
      },
    })
  ).json()
  return result
}

export const saveConsentForm = async (jwtToken, data, studyId) => {
  const baseUrl = "https://api.lampv2.unityhealth.to"
  let result = await (
    await fetch(`${baseUrl}/consent/${studyId}/participant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwtToken,
      },
      body: JSON.stringify(data),
    })
  ).json()
  return result
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    marginTop: 40,
  },
  btn: {
    marginRight: 15,
    cursor: "pointer",
    "& span": {
      cursor: "pointer",
    },
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  mb20: {
    marginBottom: 20,
  },
  backdrop: {
    zIndex: 111111,
    color: "#fff",
  },
}))

const generateToken = () => {
  return sign({ user: "guest@diig" }, token)
}

const validateEmail = (mail) => {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail) ? true : false
}

export default function ConsentForm({ ...props }) {
  const classes = useStyles()
  const [isVerified, setIsVerified] = useState(true)
  const [data, setData] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    age: 0,
    email: "",
    isVerified: !isVerified,
  })
  const [researcherId, setResearcherId] = useState(null)
  const [studyId, setStudyId] = useState(null)
  const [response, setResponse] = useState(null)
  const [researchers, setResearchers] = useState(null)
  const [studies, setStudies] = useState(null)
  const [loading, setLoading] = useState(true)

  const { t } = useTranslation()

  const validate = () => {
    return (
      data.email !== "" &&
      validateEmail(data.email) &&
      researcherId !== null &&
      studyId !== null &&
      (data.age === 0 || (data.age !== 0 && data.age > 0 && data.age <= 120))
    )
  }

  useEffect(() => {
    setLoading(true)
    const jwtToken = generateToken()
    fetchResult(jwtToken, "consent/researcher").then((result) => {
      setResearchers(result.data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (researcherId !== null) {
      setLoading(true)
      const jwtToken = generateToken()
      fetchResult(jwtToken, `consent/${researcherId}/study`).then((result) => {
        setStudies(result.data)
        setLoading(false)
      })
    }
  }, [researcherId])

  const signUp = () => {
    setLoading(true)
    const jwtToken = generateToken()
    saveConsentForm(jwtToken, data, studyId).then((result) => {
      if (!!result?.data) {
        let msg = "You have been added as a participant successfully. Your credentials will be emailed to you "
        if (!data.isVerified) msg += "after your profile verification"
        setResponse({ ...response, status: true, message: msg + "." })
        reset()
      } else {
        let message = result?.error.substring(4).split("-").join(" ")
        message = message.charAt(0).toUpperCase() + message.slice(1)
        setResponse({ ...response, status: false, message: message })
      }
      setLoading(false)
    })
  }

  const reset = () => {
    setData({ ...data, first_name: "", last_name: "", gender: "", age: 0, email: "", isVerified: !isVerified })
    setIsVerified(true)
    setResearcherId(null)
    setStudyId(null)
  }

  return (
    <form className={classes.root} noValidate autoComplete="off">
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid container justifyContent="center">
        <Grid item lg={6} md={8} sm={11} xs={11}>
          <Typography variant="h5" gutterBottom className={classes.mb20}>
            Signup
          </Typography>
          {response !== null && (
            <Box className={classes.mb20}>
              <Alert severity={!response.status ? "error" : "success"}>{response.message}</Alert>
            </Box>
          )}
          <Grid container spacing={3}>
            <Grid item lg={6} md={6} sm={12} xs={12} className={classes.mb20}>
              <FormControl fullWidth error={researcherId === null ? true : false}>
                <InputLabel id="demo-simple-select-label">{t("Researcher")}</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={researcherId}
                  onChange={(event) => setResearcherId(event.target.value)}
                  error={researcherId !== "" ? false : true}
                >
                  {(researchers || []).map((researcher) => (
                    <MenuItem value={researcher.id}>{researcher.name}</MenuItem>
                  ))}
                </Select>
                {researcherId === null && <FormHelperText>Researcher is required.</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item lg={6} md={6} sm={12} xs={12} className={classes.mb20}>
              <FormControl fullWidth error={studyId === null ? true : false}>
                <InputLabel id="demo-simple-select-label">{t("Study")}</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={studyId}
                  onChange={(event) => setStudyId(event.target.value)}
                  error={studyId !== "" ? false : true}
                >
                  {(studies || []).map((study) => (
                    <MenuItem value={study.id}>{study.name}</MenuItem>
                  ))}
                </Select>
                {studyId === null && <FormHelperText>Study is required.</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item lg={6} md={6} sm={12} xs={12} className={classes.mb20}>
              <TextField
                fullWidth
                inputProps={{ maxLength: 80 }}
                id="first-name"
                value={data.first_name ?? ""}
                label={t("First Name")}
                onChange={(event) => setData({ ...data, first_name: event.target.value })}
              />
            </Grid>
            <Grid item lg={6} md={6} sm={12} xs={12} className={classes.mb20}>
              <TextField
                fullWidth
                id="last-name"
                inputProps={{ maxLength: 80 }}
                value={data.last_name ?? ""}
                label={t("Last Name")}
                onChange={(event) => setData({ ...data, last_name: event.target.value })}
              />
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item lg={6} md={6} sm={12} xs={12}>
              <FormLabel component="legend">{t("Gender")}</FormLabel>
              <RadioGroup
                row
                aria-label="gender"
                name="gender"
                value={data.gender}
                onChange={(event) => setData({ ...data, gender: event.target.value })}
              >
                <FormControlLabel value="female" control={<Radio color="primary" />} label="Female" />
                <FormControlLabel value="male" control={<Radio color="primary" />} label="Male" />
                <FormControlLabel value="other" control={<Radio color="primary" />} label="Other" />
              </RadioGroup>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item lg={6} md={6} sm={12} xs={12}>
              <TextField
                fullWidth
                id="age"
                label={t("Age")}
                value={data.age}
                type="number"
                inputProps={{ min: 1, max: 120 }}
                InputLabelProps={{
                  shrink: true,
                }}
                error={data.age === 0 || (data.age > 0 && data.age <= 120) ? false : true}
                helperText={data.age > 0 && data.age <= 120 ? "" : "Age between 1 and 120 required."}
                onChange={(event) =>
                  setData({ ...data, age: event.target.value.length > 0 ? parseInt(event.target.value) : 0 })
                }
              />
            </Grid>
            <Grid item lg={6} md={6} sm={12} xs={12}>
              <TextField
                fullWidth
                id="email"
                label={t("Email")}
                inputProps={{ maxLength: 150 }}
                value={data.email}
                error={data.email !== "" && validateEmail(data.email) ? false : true}
                helperText={data.email !== "" && validateEmail(data.email) ? "" : "Valid Email is required"}
                onChange={(event) => setData({ ...data, email: event.target.value })}
              />
            </Grid>
          </Grid>
          <Box my={3}>
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  checked={isVerified}
                  onChange={() => {
                    setData({ ...data, isVerified: isVerified })
                    setIsVerified(!isVerified)
                  }}
                  name="agree"
                />
              }
              label={t("Please check this option to request verification from Administrator")}
            />
          </Box>
          <Button
            variant="contained"
            onClick={() => {
              if (validate()) {
                signUp()
                setResponse(null)
              }
            }}
            color="primary"
            disableElevation
            disabled={!validate()}
            className={classes.btn}
          >
            Signup
          </Button>
          <Button className={classes.btn} onClick={() => reset()}>
            Reset
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}
