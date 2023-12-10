close all; clear;
%% Settings
dt=0.0001;
max_time=20;
pressure_dif_flag=false;
%% Data- pyrogen
burn_surface=pi*(0.0171/2)^2;
fuel_density=1960;
fuel_gas_density=1.3;
burn_coefficient=4.93*10^-3;
burn_expo=0.35;
nozzle_critical_diameter=0.008;
temperature1=2300;
molar_mass1=32.934;
kappa1=1.1561;
gas_constant1=8314/molar_mass1;
initial_pressure1=0.2;
grain_length=0.03;
volume1=9.5*10^-6;
c_star=sqrt(kappa1*temperature1*gas_constant1)/(kappa1*(2/(kappa1+1))^((kappa1+1)/(2*(kappa1-1))));

%% Data- chamber
initial_pressure2 = 0.101325;
temperature2 = 293;
kappa2 = 1.4;
gas_constant2 = 287.05;
volume2 = 0.005588422;

%% Preallocate
Results.pressure1 = zeros(max_time/dt,1);
Results.pressure2 = zeros(max_time/dt,1);
Results.burn_rate = zeros(max_time/dt,1);
Results.combustion_depth = zeros(max_time/dt,1);
Results.combustion_jump = zeros(max_time/dt,1);
Results.dVdt = zeros(max_time/dt,1);
Results.V_free = zeros(max_time/dt,1);
Results.temperature2 = zeros(max_time/dt,1);
Results.molar_mass2 = zeros(max_time/dt,1);
Results.kappa2 = zeros(max_time/dt,1);
Results.gas_constant2 = zeros(max_time/dt,1);
Results.nozzle_mass_flow_rate = zeros(max_time/dt,1);
Results.produced_mass_flow_rate = zeros(max_time/dt,1);
Results.volume_mass_flow_rate = zeros(max_time/dt,1);
Results.dPdt = zeros(max_time/dt,1);
%% Time loop
Results.pressure1(1)=initial_pressure1;
Results.pressure2(1)=initial_pressure2;
Results.V_free(1)=volume1-grain_length*burn_surface;
Results.temperature2(1)=temperature2;
Results.molar_mass2(1)=8314/gas_constant2;
Results.kappa2(1)=kappa2;


for i=2:max_time/dt
    Results.pressure1(i)=Results.pressure1(i-1)+Results.dPdt(i-1)*dt;
    Results.burn_rate(i)=burn_coefficient*Results.pressure1(i)^burn_expo;
    Results.combustion_jump(i)=Results.burn_rate(i)*dt;
    Results.dVdt(i)=burn_surface*Results.burn_rate(i);
    Results.produced_mass_flow_rate(i)=Results.dVdt(i)*dt*fuel_density;
    Results.volume_mass_flow_rate(i)=Results.pressure1(i)*10^6*Results.dVdt(i)/gas_constant1/temperature1;
    Results.V_free(i)=Results.V_free(i-1)+Results.dVdt(i)*dt;
    
    if Results.pressure1(i)/Results.pressure2(i-1)>(2/(kappa1+1))^(kappa1/(kappa1-1))
        Results.nozzle_mass_flow_rate(i)=pi*(nozzle_critical_diameter/2)^2*Results.pressure1(1)*10^6/c_star;
    elseif Results.pressure1(i)>Results.pressure2(i-1)
        Results.nozzle_mass_flow_rate(i)=pi*(nozzle_critical_diameter/2)^2*fuel_gas_density*sqrt(Results.pressure1(i)-Results.pressure2(i-1));
    else
        Results.nozzle_mass_flow_rate(i)=0;
        pressure_dif_flag=true;
        Results.pressure1(i)=Results.pressure2(i-1);
    end
    if pressure_dif_flag
        Results.dPdt(i)=Results.temperature2(i)*8314/Results.molar_mass2(i)/volume2*(Results.produced_mass_flow_rate(i)-...
            Results.volume_mass_flow_rate(i)-Results.nozzle_mass_flow_rate(i))/10^6;
    else
        Results.dPdt(i)=temperature1*8314/molar_mass1/Results.V_free(i)*(Results.produced_mass_flow_rate(i)-...
            Results.volume_mass_flow_rate(i)-Results.nozzle_mass_flow_rate(i))/10^6;
    end

    m_k1 = volume2 * Results.pressure2(i-1) * 10^6 /...
        (Results.temperature2(i-1) * 8314/Results.molar_mass2(i-1)); %Masa gazu w komorze docelowej przed krokiem czasowym
    if pressure_dif_flag
        m_p=Results.produced_mass_flow_rate(i);
    else
        m_p = dt * Results.nozzle_mass_flow_rate(i); %Masa wpływającego gazu
    end
    m_k2 = m_k1 + m_p;%Masa gazu w komorze po kroku czasowym
    c_pk1 = 8314/Results.molar_mass2(i-1) * Results.kappa2(i-1) /...
        (Results.kappa2(i-1) - 1); %Ciepło właściwe w komorze przed krokiem czasowym
    c_pp = gas_constant1 * kappa1 / (kappa1 - 1); %Ciepło właściwe wpływającego gazu
    c_pk2 = (m_k1 * c_pk1 + m_p * c_pp) / m_k2; %Ciepło właściwe w komorze po kroku czasowym
    Results.temperature2(i) = (c_pk1 * Results.temperature2(i-1) * m_k1 + c_pp * temperature1 * m_p) / (m_k2 * c_pk2);
    Results.gas_constant2(i) = (m_k1 * 8314/Results.molar_mass2(i-1) + m_p * gas_constant1) / m_k2;
    Results.molar_mass2(i) = 8314.463 / Results.gas_constant2(i);
    Results.kappa2(i) = c_pk2/(c_pk2-Results.gas_constant2(i));
    Results.pressure2(i) = m_k2 * Results.gas_constant2(i) * Results.temperature2(i) / (volume2 * 10^6);
    if sum(Results.combustion_jump)>grain_length
        break;
    end
    final_iteration=i;
end
time=linspace(0,final_iteration*dt,final_iteration+1)';
plot(time(1:end-1),Results.temperature2(1:final_iteration));
disp(sum(Results.combustion_jump));
