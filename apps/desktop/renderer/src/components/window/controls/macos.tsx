export const MacWindowControls = () => {
  return (
    <div className="flex space-x-2 px-2.5" style={{ WebkitAppRegion: "no-drag" as any }}>
      <button
        className="h-3 w-3 rounded-full bg-red-500"
        onClick={() => window.desktopApi?.window.close()}
      />
      <button
        className="h-3 w-3 rounded-full bg-yellow-500"
        onClick={() => window.desktopApi?.window.minimize()}
      />
      <button
        className="h-3 w-3 rounded-full bg-green-500"
        onClick={() => window.desktopApi?.window.maximize()}
      />
    </div>
  );
};
