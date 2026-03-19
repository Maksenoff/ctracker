drop view if exists game_stats;
create view game_stats as
select
  g.id as game_id,
  g.user_id,
  g.name as game_name,
  g.cover_url,
  count(distinct b.id) as total_bosses,
  count(distinct case when br.completed then b.id end) as completed_bosses,
  count(distinct cc.id) filter (where cc.completed) as total_challenges_done,
  case when count(distinct b.id) > 0
    then round((count(distinct case when br.completed then b.id end)::numeric / count(distinct b.id)) * 100, 1)
    else 0
  end as completion_percentage
from games g
left join bosses b on b.game_id = g.id
left join boss_runs br on br.boss_id = b.id and br.user_id = g.user_id
left join challenge_completions cc on cc.boss_run_id = br.id and cc.user_id = g.user_id
group by g.id, g.user_id, g.name, g.cover_url;
