// Core Imports
import React, { useState, useEffect } from "react"
import { Box, Typography, Grid, Button, Backdrop, CircularProgress } from "@material-ui/core"
import { makeStyles, createStyles } from "@material-ui/core/styles"
import { useSnackbar } from "notistack"
import { useTranslation } from "react-i18next"
import LAMP from "lamp-core"

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    btnBlue: {
      background: "#7599FF",
      borderRadius: "40px",
      minWidth: 100,
      boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)",
      lineHeight: "38px",
      cursor: "pointer",
      textTransform: "capitalize",
      fontSize: "16px",
      color: "#fff",
      "& svg": { marginRight: 8 },
      "&:hover": { background: "#5680f9" },
    },
    btnGrey: {
      background: "#f4f4f4",
      borderRadius: "40px",
      minWidth: 100,
      boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.20)",
      lineHeight: "38px",
      cursor: "pointer",
      textTransform: "capitalize",
      fontSize: "16px",
      color: "#333",
      marginLeft: 15,
      "& svg": { marginRight: 8 },
      "&:hover": { background: "#f8f8f8" },
    },
    backdrop: {
      zIndex: 111111,
      color: "#fff",
    },
    rowContainer: {
      display: "flex",
      width: "100%",
      alignItems: "center",
      height: 36,
      fontWeight: 600,
    },
    contentText: {
      color: "rgba(0, 0, 0, 0.75)",
      fontWeight: "bold",
      fontSize: 14,
      marginLeft: 10,
    },
  })
)

export const callAPI = async (authString, id, methodType) => {
  const baseUrl = "https://api.lampv2.unityhealth.to"
  let result = await (
    await fetch(`${baseUrl}/consent/participant/${id}`, {
      method: methodType,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + authString,
      },
      body: methodType === "PUT" ? JSON.stringify({ isVerified: true }) : null,
    })
  ).json()
  return result
}

export default function PatientView({
  participant,
  researcherId,
  onClose,
  ...props
}: {
  participant: any
  researcherId: string
  onClose: Function
}) {
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let lampAuthId = LAMP.Auth._auth.id
    let lampAuthPswd = LAMP.Auth._auth.password
    setLoading(true)
    callAPI(lampAuthId + ":" + lampAuthPswd, participant?.id, "GET").then((result) => {
      setUser(result?.data ? result?.data[0] : null)
      setLoading(false)
    })
  }, [])

  const verifyUser = () => {
    setLoading(true)
    let lampAuthId = LAMP.Auth._auth.id
    let lampAuthPswd = LAMP.Auth._auth.password
    callAPI(lampAuthId + ":" + lampAuthPswd, participant?.id, "PUT").then((res) => {
      if (!!res?.data) {
        enqueueSnackbar(t("Patient has been verified successfully. Your credentials will be emailed to you."), {
          variant: "success",
        })
        onClose(true)
      } else {
        enqueueSnackbar(t(res?.error), { variant: "error" })
      }
      setLoading(false)
    })
  }

  return (
    <div className={classes.root}>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid container justifyContent="center">
        <Grid item lg={5} md={8} sm={11} xs={11}>
          <Typography variant="h6" gutterBottom>
            {t("Patient details")}
          </Typography>
          <div className={classes.rowContainer} style={{ backgroundColor: "#ECF4FF" }}>
            <Typography className={classes.contentText} style={{ flex: 1 }}>
              {t("First name")}:
            </Typography>
            <Typography className={classes.contentText} style={{ flex: 1 }}>
              {user?.first_name ?? ""}
            </Typography>
          </div>
          <div className={classes.rowContainer} style={{ backgroundColor: "transparent" }}>
            <Typography className={classes.contentText} style={{ flex: 1 }}>
              {t("Last name")}:
            </Typography>
            <Typography className={classes.contentText} style={{ flex: 1 }}>
              {user?.last_name ?? ""}
            </Typography>
          </div>
          <div className={classes.rowContainer} style={{ backgroundColor: "#ECF4FF" }}>
            <Typography className={classes.contentText} style={{ flex: 1 }}>
              {t("Age")}:
            </Typography>
            <Typography className={classes.contentText} style={{ flex: 1 }}>
              {user?.age ?? ""}
            </Typography>
          </div>
          <div className={classes.rowContainer} style={{ backgroundColor: "transparent" }}>
            <Typography className={classes.contentText} style={{ flex: 1 }}>
              {t("Gender")}:
            </Typography>
            <Typography className={classes.contentText} style={{ flex: 1 }}>
              {user?.gender ?? ""}
            </Typography>
          </div>
          <div className={classes.rowContainer} style={{ backgroundColor: "#ECF4FF" }}>
            <Typography className={classes.contentText} style={{ flex: 1 }}>
              {t("Email")}:
            </Typography>
            <Typography className={classes.contentText} style={{ flex: 1 }}>
              {user?.email ?? ""}
            </Typography>
          </div>
          <Box my={3}>
            {!participant.isVerified && (
              <Box>
                <Button onClick={() => verifyUser()} className={classes.btnBlue}>
                  {t("Verify")}
                </Button>
                <Button onClick={() => onClose(false)} className={classes.btnGrey}>
                  {t("Cancel")}
                </Button>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </div>
  )
}
