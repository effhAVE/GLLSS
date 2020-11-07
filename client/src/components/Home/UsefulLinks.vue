<template>
  <div>
    <h3 class="title">Useful links</h3>
    <ul>
      <li>
        <a href="https://help.gll.gg/hc/en-us">GLL Support Site</a>
      </li>
      <li>
        <a href=" https://pubg.seatlon.eu/">PUBG Match/Player Search</a>
      </li>
      <li>
        <a href="https://gll.gg/report-player">Cheater Report Form</a>
      </li>
      <li>
        <a href="https://globalesports.wpengine.com/wp-content/uploads/2020/07/UPDATED-SUPER-v2.1.0.pdf">SUPER Settings 2.1.0</a>
      </li>
      <li>
        <a href="https://docs.google.com/document/d/1bQuPQxZusipVZH1FvcojBihE8DPR08sHqg2SHJGe4Es/edit">Nations Royale Presets</a>
      </li>
      <li>
        <a href="https://docs.google.com/spreadsheets/d/1P8nCK_AAxBRWDmXNLzcD6GV4lzxNaOYmzqAoWwU2rTo/edit?usp=sharing">Apex Scrims Seeding Sheet</a>
      </li>
      <li>
        <a href="https://forms.gle/CSvPYkJb2dL8XeJ97">Application form for Casters</a>
      </li>
      <li>
        <a href="https://apex.seatlon.eu/">Apex Match Token Checker</a>
      </li>
    </ul>
    <div v-if="$store.getters.hasPermission('hosting.canLead')">
      <h4 class="subtitle">Teamleaders:</h4>
      <ul>
        <li>
          <a href="https://docs.google.com/spreadsheets/d/1k7wSxW9dDpgx46CSHYAxFc_dR1DEXovSEecU_3pkH2s/edit?usp=sharing"
            >Autochess Seeding Template - 256
          </a>
        </li>
        <li>
          <a href="https://docs.google.com/spreadsheets/d/17W_nAk9P6D_vQqQt_MoFKNUED6KsOYskYQtuYXr5au8/edit?usp=sharing"
            >Seeding Toby's Tryhard Thursday
          </a>
        </li>
        <li>
          <a href="https://docs.google.com/spreadsheets/d/1VGbRvQH0Gwsj3J4QrmAuvD70FnvT0UWN0Zv46YnXCEo/edit#gid=0">List of Approved Casters </a>
        </li>
      </ul>
    </div>
  </div>
</template>