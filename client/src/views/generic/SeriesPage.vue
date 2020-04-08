<template>
  <v-card height="100%" color="transparent" v-if="series">
    <v-card-title>
      {{ series.name }}
      <v-spacer></v-spacer>
      <v-dialog v-model="editModal" persistent max-width="600px">
        <template v-slot:activator="{ on }">
          <v-btn
            class="success mr-4"
            v-if="user.roles.includes('admin')"
            v-on="on"
          >
            Edit series
          </v-btn>
        </template>
        <v-card class="primary">
          <v-card-text>
            <v-container>
              <SeriesForm
                :series="series"
                @cancel="editModal = false"
                @submit="editSeries"
              />
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model="deleteModal" max-width="500px" overlay-color="primary">
        <template v-slot:activator="{ on }">
          <v-btn
            class="error"
            v-if="user.roles.includes('admin')"
            v-on="on"
            :disabled="!!series.tournaments.length"
          >
            {{
              series.tournaments.length ? "Cannot be deleted" : "Delete series"
            }}
          </v-btn>
        </template>

        <v-card>
          <v-card-title class="headline">Are you sure?</v-card-title>
          <v-card-text
            >You're about to delete {{ series.name }} from the database. This
            action cannot be undone.</v-card-text
          >
          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="deleteSeries(series._id)">
              Yes
            </v-btn>
            <v-btn color="success" text @click="deleteModal = false">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-title>
    <span
      class="warning--text mb-4"
      v-if="series.tournaments.length && user.roles.includes('admin')"
      >Warning: Series cannot be deleted if they include tournaments.</span
    >
    <SeriesTable :series="series" />
    <v-btn
      class="mt-12"
      :loading="tournamentsLoading"
      :disabled="tournamentsLoading"
      color="accent black--text"
      @click="getTournaments"
      v-if="!tournamentsLoaded"
    >
      Load series' tournaments
      <template v-slot:loader>
        <span>Loading...</span>
      </template>
    </v-btn>
    <TournamentsSimplifiedTable v-else :tournaments="tournaments" />
  </v-card>
</template>

<script>
import SeriesTable from "../../components/SeriesTable";
import SeriesForm from "../../components/Forms/SeriesForm";
import TournamentsSimplifiedTable from "../../components/TournamentsList/Simplified";

export default {
  name: "Series",
  components: {
    SeriesTable,
    SeriesForm,
    TournamentsSimplifiedTable
  },
  props: {
    user: Object
  },
  data() {
    return {
      id: this.$route.params.seriesID,
      series: null,
      tournaments: [],
      deleteModal: false,
      editModal: false,
      tournamentsLoading: false,
      tournamentsLoaded: false
    };
  },
  methods: {
    getSeries(id) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .get(`${APIURL}/series/${id}`)
        .then(response => {
          this.series = response.data;
        })
        .catch(error => {
          if (error.response.status === 400) {
            this.$router.push("/notfound");
          }
        });
    },
    getTournaments() {
      this.tournamentsLoading = true;
      const APIURL = process.env.VUE_APP_APIURL;
      this.$http
        .get(`${APIURL}/series/${this.series._id}/tournaments`)
        .then(response => {
          this.tournaments = response.data;
          this.tournamentsLoading = false;
          this.tournamentsLoaded = true;
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            message: "Error while fetching tournaments.",
            type: "error"
          });
          this.tournamentsLoading = false;
        });
    },
    deleteSeries(id) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.deleteModal = false;
      this.$http
        .delete(`${APIURL}/series/${id}`)
        .then(response => {
          this.$store.commit("snackbarMessage", {
            message: "Series successfully deleted!",
            type: "success"
          });
          this.$router.push("/series");
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            message: "Error while deleting the series.",
            type: "error"
          });
        });
    },
    editSeries(series) {
      const APIURL = process.env.VUE_APP_APIURL;
      this.editModal = false;
      this.$http
        .put(`${APIURL}/series/${series._id}`, series)
        .then(response => {
          this.$store.commit("snackbarMessage", {
            message: "Series successfully edited!",
            type: "success"
          });
          this.$router.go();
        })
        .catch(error => {
          this.$store.commit("snackbarMessage", {
            message: "Error while editing the series.",
            type: "error"
          });
        });
    }
  },
  watch: {
    "$route.params": {
      handler(newValue) {
        const { seriesID } = newValue;
        if (seriesID) {
          this.getSeries(seriesID);
        } else {
          this.tournament = null;
        }
      },
      immediate: true
    }
  }
};
</script>