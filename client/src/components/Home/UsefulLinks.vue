<template>
  <div>
    <h3 class="title">Useful links</h3>
    <ul>
      <li>
        <a href="https://github.com/effhAVE/GLLSS/blob/master/GUIDE.md"
          >GLLSS Guide</a
        >
      </li>
      <li>
        <a href="https://help.gll.gg/hc/en-us">GLL Support Site</a>
      </li>
      <li>
        <a href=" https://pubg.seatlon.eu/">PUBG Match/Player Search</a>
      </li>
      <li>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLScdXNynI54HnMaT9i0x0DgAdG6JCZIGVI0b69suKA-7G7ig2A/viewform"
          >Cheater Report Form</a
        >
      </li>
      <li>
        <a
          href="https://globalesports.wpengine.com/wp-content/uploads/2020/02/PUBG_Global_Rules-SUPER-v2.0.0.pdf"
          >SUPER Settings 2.0.0</a
        >
      </li>
      <li>
        <a
          href="https://docs.google.com/document/d/1bQuPQxZusipVZH1FvcojBihE8DPR08sHqg2SHJGe4Es/edit"
          >Nations Royale Presets</a
        >
      </li>
      <li>
        <a
          href="https://docs.google.com/spreadsheets/d/1yx3vwJVjyTexO5BTjEEndUDsk_jnBORqlmuCeX-QYTY/edit?usp=sharing"
          >Apex Scrims Seeding Sheet</a
        >
      </li>
      <li>
        <a
          href="https://docs.google.com/spreadsheets/d/1AqXDjsLoXGoVyD6p1RK4h82gZ0kErYCLm3SRFORNU24/edit#gid=798581813"
          >Accounts in use</a
        >
      </li>
      <li>
        <a href="https://forms.gle/CSvPYkJb2dL8XeJ97"
          >Application form for Casters</a
        >
      </li>
      <li>
        <a
          href="https://docs.google.com/spreadsheets/d/1rIovhh5aYKQakpwVO23BeYj6U7zX3_dZvZhsD0JVVhA/edit?usp=sharing"
          >Apex Lobby Codes</a
        >
      </li>
    </ul>
    <div v-if="isTeamleader">
      <h4 class="subtitle">Teamleaders:</h4>
      <ul>
        <li>
          <a
            href="https://docs.google.com/spreadsheets/d/1k7wSxW9dDpgx46CSHYAxFc_dR1DEXovSEecU_3pkH2s/edit?usp=sharing"
            >Autochess Seeding Template - 256
          </a>
        </li>
        <li>
          <a
            href="https://docs.google.com/spreadsheets/d/17W_nAk9P6D_vQqQt_MoFKNUED6KsOYskYQtuYXr5au8/edit?usp=sharing"
            >Seeding Toby's Tryhard Thursday
          </a>
        </li>
        <li>
          <a
            href="https://docs.google.com/spreadsheets/d/1fArbNdRzg-RcLdR2JJqmD3_1Z2p5pYxIT1FnvpuXy-M/edit?usp=sharing"
            >Team Lead Schedule
          </a>
        </li>
        <li>
          <a
            href="https://docs.google.com/spreadsheets/d/1VGbRvQH0Gwsj3J4QrmAuvD70FnvT0UWN0Zv46YnXCEo/edit#gid=0"
            >List of Approved Casters
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    isTeamleader: {
      type: Boolean
    }
  }
};
</script>