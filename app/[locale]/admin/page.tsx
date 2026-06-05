import { prisma } from "@/db/prisma";

type DailyMetricRow = {
  day: Date;
  page_view: bigint;
  generate_click: bigint;
  generate_success: bigint;
  generate_failed: bigint;
  download_click: bigint;
};

function toNumber(value: bigint | number | null | undefined) {
  return Number(value || 0);
}

async function getDailyMvpMetrics() {
  const rows = await prisma
    .$queryRaw<DailyMetricRow[]>`
      SELECT
        date_trunc('day', created_at)::date AS day,
        COUNT(*) FILTER (WHERE event_type = 'page_view') AS page_view,
        COUNT(*) FILTER (WHERE event_type = 'generate_click') AS generate_click,
        COUNT(*) FILTER (WHERE event_type = 'generate_success') AS generate_success,
        COUNT(*) FILTER (WHERE event_type = 'generate_failed') AS generate_failed,
        COUNT(*) FILTER (WHERE event_type = 'download_click') AS download_click
      FROM polaroidai_mvp_events
      WHERE created_at >= now() - interval '14 days'
        AND is_bot = false
      GROUP BY 1
      ORDER BY 1 DESC
    `
    .catch((error) => {
      console.error("Failed to fetch MVP metrics:", error);
      return [];
    });

  return rows.map((row) => ({
    day: row.day,
    pageView: toNumber(row.page_view),
    generateClick: toNumber(row.generate_click),
    generateSuccess: toNumber(row.generate_success),
    generateFailed: toNumber(row.generate_failed),
    downloadClick: toNumber(row.download_click),
  }));
}

export default async function AdminPage() {
  const metrics = await getDailyMvpMetrics();
  const totals = metrics.reduce(
    (acc, item) => ({
      pageView: acc.pageView + item.pageView,
      generateClick: acc.generateClick + item.generateClick,
      generateSuccess: acc.generateSuccess + item.generateSuccess,
      generateFailed: acc.generateFailed + item.generateFailed,
      downloadClick: acc.downloadClick + item.downloadClick,
    }),
    {
      pageView: 0,
      generateClick: 0,
      generateSuccess: 0,
      generateFailed: 0,
      downloadClick: 0,
    },
  );

  return (
    <div className="flex-1 space-y-6 overflow-auto p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          MVP 每日数据
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          仅统计非 bot 流量，最近 14 天。
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        {[
          ["访问量", totals.pageView],
          ["生成点击", totals.generateClick],
          ["成功数", totals.generateSuccess],
          ["失败数", totals.generateFailed],
          ["下载数", totals.downloadClick],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="text-sm text-gray-500">{label}</div>
            <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 font-medium">日期</th>
              <th className="px-4 py-3 font-medium">访问量</th>
              <th className="px-4 py-3 font-medium">生成点击</th>
              <th className="px-4 py-3 font-medium">成功</th>
              <th className="px-4 py-3 font-medium">失败</th>
              <th className="px-4 py-3 font-medium">下载</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((item) => (
              <tr
                key={item.day.toISOString()}
                className="border-t border-gray-100 dark:border-gray-800"
              >
                <td className="px-4 py-3">
                  {item.day.toISOString().slice(0, 10)}
                </td>
                <td className="px-4 py-3">{item.pageView}</td>
                <td className="px-4 py-3">{item.generateClick}</td>
                <td className="px-4 py-3">{item.generateSuccess}</td>
                <td className="px-4 py-3">{item.generateFailed}</td>
                <td className="px-4 py-3">{item.downloadClick}</td>
              </tr>
            ))}
            {!metrics.length && (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={6}>
                  暂无 MVP 事件数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
